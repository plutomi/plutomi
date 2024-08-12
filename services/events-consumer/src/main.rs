use async_nats::jetstream::Context;
use async_nats::jetstream::{self, consumer::Consumer, Message};
use bytes::Bytes;
use dotenv::dotenv;
use futures::future::BoxFuture;
use futures::stream::StreamExt;
use serde_json::json;
use shared::events::{MaxDeliverAdvisory, PlutomiEvent, PlutomiEventPayload, TOTPRequestedPayload};
use shared::get_current_time::get_current_time;
use shared::logger::{LogLevel, LogObject, Logger, LoggerContext};
use shared::nats::{
    connect_to_nats, create_stream, publish_event, ConnectToNatsOptions, CreateStreamOptions,
    PublishEventOptions,
};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use std::vec;
use time::OffsetDateTime;
use tokio::task::JoinHandle;

// TODO: Acceptance criteria
// - [ ] Can read .env parsed
// - [ ] Can connect to MongoDB
// - [ ] Can consume events / consumer groups
// - [ ] Can process/ publish  events
// - [ ] Can generate ids with shared lib

// Each consumer runs in its own task and will restart itself if it encounters an error
// We use a shared consumer_statuses to keep track of errors across all consumers
// The main function will continue running indefinitely, even if one or more consumers fail
// Errors are logged but don't cause the entire application to crash
// If all consumers somehow exit (which shouldn't happen under normal circumstances), the application will log final statuses and exit

struct MessageHandlerOptions<'a> {
    message: &'a Message,
    logger: Arc<Logger>,
    jetstream_context: &'a Context,
    consumer_name: &'a str,
}

type MessageHandler =
    Arc<dyn Fn(MessageHandlerOptions) -> BoxFuture<'_, Result<(), String>> + Send + Sync>;

#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), String> {
    dotenv().ok();

    let logger = Logger::init(LoggerContext {
        caller: "events-consumer",
    });

    // TODO: Add nats url to secrets

    let jetstream_context = connect_to_nats(ConnectToNatsOptions {
        logger: Arc::clone(&logger),
    })
    .await?;

    let stream_configs: Vec<CreateStreamOptions> = vec![
        // Main events stream for all messages
        // events.totp.requested or events.email.sent
        CreateStreamOptions {
            jetstream_context: &jetstream_context,
            stream_name: "events".to_string(),
            subjects: vec!["events.>".to_string()],
        },
        // The format here is consumer based: events-retry.consumer-name
        // That way we only retry messages that failed for a specific consumer
        // ie: SES is down, don't resend the message to ClickHouse or MeiliSearch consumers
        // The logic here doesn't change, but the retry backoff does
        CreateStreamOptions {
            jetstream_context: &jetstream_context,
            stream_name: "events-retry".to_string(),
            subjects: vec!["events-retry.>".to_string()],
        },
        // DLQ for messages that have failed too many times and require manual intervention
        // Same formats as the retry stream: events-dlq.consumer-name
        CreateStreamOptions {
            jetstream_context: &jetstream_context,
            stream_name: "events-dlq".to_string(),
            subjects: vec!["events-dlq.>".to_string()],
        },
    ];

    // Create all streams
    let streams: HashMap<String, Arc<jetstream::stream::Stream>> =
        futures::future::try_join_all(stream_configs.into_iter().map(create_stream))
            .await?
            .into_iter()
            .collect();

    let consumer_configs: Vec<ConsumerOptions> = vec![
        ConsumerOptions {
            // This consumer listens to all events that have reached their max delivery attempts
            // and forwards them to the proper retry/dlq stream.
            // https://docs.nats.io/using-nats/developer/develop_jetstream/consumers#dead-letter-queues-type-functionality
            consumer_name: String::from("meta-consumer"), // TODO rename to max_deliveries handler or something
            // We do not have separate per stream as I figured it might be overkill
            filter_subjects: vec!["$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.>".to_string()],
            stream: Arc::clone(&streams["events"]),
            jetstream_context: Arc::clone(&jetstream_context),
            logger: Arc::clone(&logger),
            message_handler: Arc::new(handle_meta),
            max_delivery_attempts: 10000,
            redeliver_after: Duration::from_secs(2),
        },
        ConsumerOptions {
            consumer_name: String::from("email-consumer"),
            filter_subjects: vec![PlutomiEvent::TOTP_REQUESTED_EVENT.to_string()],
            stream: Arc::clone(&streams["events"]),
            jetstream_context: Arc::clone(&jetstream_context),
            logger: Arc::clone(&logger),
            message_handler: Arc::new(send_email),
            max_delivery_attempts: 1,
            redeliver_after: Duration::from_secs(3),
        },
        ConsumerOptions {
            consumer_name: String::from("retry-email-consumer"),
            filter_subjects: vec![String::from("events-retry.email-consumer")], // TODO use consts to avoid typos
            stream: Arc::clone(&streams["events-retry"]),
            jetstream_context: Arc::clone(&jetstream_context),
            logger: Arc::clone(&logger),
            message_handler: Arc::new(send_email),
            max_delivery_attempts: 1,
            redeliver_after: Duration::from_secs(3),
        },
        ConsumerOptions {
            consumer_name: String::from("dlq-email-consumer"),
            filter_subjects: vec![String::from("events-dlq.email-consumer")],
            jetstream_context: Arc::clone(&jetstream_context),
            stream: Arc::clone(&streams["events-dlq"]),
            logger: Arc::clone(&logger),
            message_handler: Arc::new(send_email),
            max_delivery_attempts: 1,
            redeliver_after: Duration::from_secs(60),
        },
    ];

    // Spawn all consumers in their own threads
    let consumer_handles: Vec<_> = consumer_configs.into_iter().map(spawn_consumer).collect();

    // Run indefinitely
    let _ = futures::future::join_all(consumer_handles).await;

    tokio::signal::ctrl_c()
        .await
        .expect("Failed to wait for ctrl_c signal");

    Ok(())
}

struct GetConsumerInfoResult {
    consumer_name: String,
    consumer: Consumer<jetstream::consumer::pull::Config>,
}

// Get the consumer name from the consumer when calling run_consumer
async fn get_consumer_info(
    mut consumer: Consumer<jetstream::consumer::pull::Config>,
) -> Result<GetConsumerInfoResult, String> {
    let info = consumer
        .info()
        .await
        .map_err(|e| format!("Error getting consumer info: {}", e))?;

    let consumer_name = info
        .config
        .name
        .as_deref()
        .unwrap_or_else(|| "unknown-consumer-name")
        .to_string();

    Ok(GetConsumerInfoResult {
        consumer_name,
        consumer,
    })
}

struct RunConsumerOptions {
    consumer: Consumer<jetstream::consumer::pull::Config>,
    message_handler: MessageHandler,
    logger: Arc<Logger>,
    jetstream_context: Arc<jetstream::Context>,
}
async fn run_consumer(
    RunConsumerOptions {
        consumer,
        message_handler,
        logger,
        jetstream_context,
    }: RunConsumerOptions,
) -> Result<(), String> {
    // Fetch the info once on start
    let GetConsumerInfoResult {
        consumer_name,
        consumer,
    } = get_consumer_info(consumer).await?;

    logger.log(LogObject {
        level: LogLevel::Info,
        message: format!("{} started", &consumer_name),
        error: None,
        _time: get_current_time(OffsetDateTime::now_utc()),
        request: None,
        response: None,
        data: None,
    });

    loop {
        let mut messages = match consumer.messages().await {
            Ok(msgs) => msgs,
            Err(e) => {
                // Log and restart the consumer
                let error = e.to_string();
                logger.log(LogObject {
                    level: LogLevel::Error,
                    message: format!(
                        "Failed to get message stream in {} - restarting!",
                        &consumer_name
                    ),
                    error: Some(json!({ "error": error })),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    request: None,
                    response: None,
                    data: None,
                });
                return Err(error);
            }
        };

        while let Some(message_result) = messages.next().await {
            match message_result {
                Ok(message) => {
                    logger.log(LogObject {
                        level: LogLevel::Info,
                        message: format!(
                            "Sending {} message to {} handler",
                            &message.subject, &consumer_name
                        ),
                        error: None,
                        _time: get_current_time(OffsetDateTime::now_utc()),
                        request: None,
                        response: None,
                        data: None,
                    });
                    if let Err(e) = message_handler(MessageHandlerOptions {
                        message: &message,
                        logger: Arc::clone(&logger),
                        jetstream_context: &jetstream_context,
                        consumer_name: &consumer_name,
                    })
                    .await
                    {
                        // Log the error and continue to the next message
                        // ack_wait will send it to us again
                        logger.log(LogObject {
                            level: LogLevel::Error,
                            message: format!(
                                "Error processing message {} in {}",
                                &message.subject, &consumer_name
                            ),
                            error: Some(json!({ "error": e })),
                            _time: get_current_time(OffsetDateTime::now_utc()),
                            request: None,
                            response: None,
                            data: None,
                        });
                        continue;
                    } else {
                        logger.log(LogObject {
                            level: LogLevel::Info,
                            message: format!(
                                "Message {} processed in {}",
                                &message.subject, &consumer_name
                            ),
                            error: None,
                            _time: get_current_time(OffsetDateTime::now_utc()),
                            request: None,
                            response: None,
                            data: None,
                        });
                    }

                    // Acknowledge the message if it was processed successfully
                    if let Err(e) = message.ack().await {
                        let error: String = e.to_string();
                        // Log the acknowledgment error and continue to the next message
                        // ack_wait will send it to us again
                        logger.log(LogObject {
                            level: LogLevel::Error,
                            message: format!(
                                "Error acknowledging message {} in {}",
                                &message.subject, &consumer_name
                            ),
                            error: Some(json!({ "error": error })),
                            _time: get_current_time(OffsetDateTime::now_utc()),
                            request: None,
                            response: None,
                            data: None,
                        });
                        continue;
                    } else {
                        logger.log(LogObject {
                            level: LogLevel::Info,
                            message: format!(
                                "Message {} acknowledged in {}",
                                &message.subject, &consumer_name
                            ),
                            error: None,
                            _time: get_current_time(OffsetDateTime::now_utc()),
                            request: None,
                            response: None,
                            data: None,
                        });
                    }
                }
                Err(error) => {
                    // Log error and restart the consumer if we had issues receiving the message
                    let error: String = error.to_string();
                    logger.log(LogObject {
                        level: LogLevel::Error,
                        message: format!(
                            "Error receiving message in {} - restarting",
                            &consumer_name
                        ),
                        error: Some(json!({ "error": error })),
                        _time: get_current_time(OffsetDateTime::now_utc()),
                        request: None,
                        response: None,
                        data: None,
                    });
                    return Err(error);
                }
            }
        }
    }
}
struct ConsumerOptions {
    // Jetstream context to pass down to the run_consumer function
    jetstream_context: Arc<jetstream::Context>,
    // A reference to the event stream to create the consumer on
    stream: Arc<jetstream::stream::Stream>,
    consumer_name: String,
    // What events the consumer will listen to
    filter_subjects: Vec<String>,
    message_handler: MessageHandler,
    logger: Arc<Logger>,
    // How many times to attempt to deliver a message before moving it to the next retry/dlq stream
    max_delivery_attempts: i64,
    // How long to wait before redelivering a message - ie: ack_wait
    redeliver_after: Duration,
}

const RESTART_ON_ERROR_DURATION: std::time::Duration = std::time::Duration::from_secs(5);

async fn spawn_consumer(
    ConsumerOptions {
        jetstream_context,
        stream,
        consumer_name,
        filter_subjects,
        message_handler,
        logger,
        max_delivery_attempts,
        redeliver_after,
    }: ConsumerOptions,
) -> JoinHandle<()> {
    tokio::spawn(async move {
        loop {
            let consumer = match stream
                .get_or_create_consumer(
                    &consumer_name,
                    jetstream::consumer::pull::Config {
                        durable_name: Some(consumer_name.clone()),
                        name: Some(consumer_name.clone()),
                        filter_subjects: filter_subjects.clone(),
                        ack_wait: redeliver_after,
                        max_deliver: max_delivery_attempts,
                        ..Default::default()
                    },
                )
                .await
            {
                Ok(consumer) => consumer,
                Err(e) => {
                    logger.log(LogObject {
                        level: LogLevel::Error,
                        message: format!("Error creating consumer: {}", &consumer_name),
                        error: Some(json!({ "error": e.to_string() })),
                        _time: get_current_time(OffsetDateTime::now_utc()),
                        request: None,
                        response: None,
                        data: None,
                    });
                    return;
                }
            };

            // Run the consumer
            if let Err(e) = run_consumer(RunConsumerOptions {
                consumer,
                message_handler: Arc::clone(&message_handler),
                logger: Arc::clone(&logger),
                jetstream_context: Arc::clone(&jetstream_context),
            })
            .await
            {
                logger.log(LogObject {
                    level: LogLevel::Error,
                    message: format!(
                        "{} error - restarting in {:?} seconds",
                        consumer_name, RESTART_ON_ERROR_DURATION
                    ),
                    error: Some(json!({ "error": e.to_string() })),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    request: None,
                    response: None,
                    data: None,
                });
                tokio::time::sleep(RESTART_ON_ERROR_DURATION).await;
            }
        }
    })
}

/**
 * While inside a message handler, check if a message is in the retry or DLQ stream
 * If it is, lookup the original event in the main stream and return it
 * Otherwise, return the original message
 */
async fn extract_message(
    message: &Message,
    logger: Arc<Logger>,
    jetstream_context: &Context,
) -> Result<PlutomiEvent, String> {
    let (original_subject, original_payload): (String, Bytes) =
        if message.subject.starts_with("events-retry.")
            || message.subject.starts_with("events-dlq.")
        {
            logger.log(LogObject {
                level: LogLevel::Info,
                message: format!("JOSE DEBUG IN EXTRACT {}", message.subject),
                _time: get_current_time(OffsetDateTime::now_utc()),
                error: None,
                request: None,
                response: None,
                data: Some(json!({ "entire_message_payload": message.payload.clone() })),
            });
            // Parse the advisory message
            let advisory: MaxDeliverAdvisory = serde_json::from_slice(&message.payload)
                .map_err(|e| format!("Failed to parse max delivery advisory message: {}", e))?;

            // Look up the original event in the main stream
            let stream = jetstream_context
                .get_stream(&advisory.stream)
                .await
                .map_err(|e| format!("Failed to get stream: {}", e))?;

            let original_message = stream
                .get_raw_message(advisory.stream_seq)
                .await
                .map_err(|e| format!("Failed to get original message: {}", e))?;

            (original_message.subject, original_message.payload.into())
        } else {
            // Return the passed in message
            (message.subject.to_string(), message.payload.clone())
        };

    let event = PlutomiEvent::from_jetstream(&original_subject, &original_payload)?;

    logger.log(LogObject {
        level: LogLevel::Info,
        message: format!(
            "JOSE DEBUG EXTRACTED MESSAGE NEED TO PARSE: {}",
            original_subject
        ),
        _time: get_current_time(OffsetDateTime::now_utc()),
        error: None,
        request: None,
        response: None,
        data: Some(json!({ "subject": original_subject, "payload": original_payload })),
    });

    // Parse the payload based on the event type
    match event {
        PlutomiEvent::TOTPRequested(ps) => {
            let payload: TOTPRequestedPayload = serde_json::from_slice(&original_payload)
                .map_err(|e| format!("Failed to parse TOTP requested payload: {}", e))?;

            Ok(PlutomiEvent::TOTPRequested(ps))
        }

        // Unused
        _ => {
            let msg = format!(
                "Unknown event type while extracting message: {}",
                original_subject
            );
            logger.log(LogObject {
                level: LogLevel::Warn,
                message: msg.clone(),
                _time: get_current_time(OffsetDateTime::now_utc()),
                error: None,
                request: None,
                response: None,
                data: None,
            });

            Err(msg)
        }
    }
}

fn send_email(
    MessageHandlerOptions {
        message,
        logger,
        jetstream_context,
        consumer_name,
    }: MessageHandlerOptions,
) -> BoxFuture<'_, Result<(), String>> {
    Box::pin(async move {
        let event = extract_message(&message, Arc::clone(&logger), jetstream_context).await?;

        logger.log(LogObject {
            level: LogLevel::Info,
            message: format!(
                "Processing {:?} message in {}",
                &event.event_type(),
                &consumer_name
            ),
            _time: get_current_time(OffsetDateTime::now_utc()),
            error: None,
            request: None,
            response: None,
            // TODO payload is in bytes, should be converted to string
            data: Some(json!({ "subject": &event.event_type(), "payload": &message.payload })),
        });

        match event {
            PlutomiEvent::TOTPRequested(payload) => {
                let x = payload.email;
                // Send the email
                // let payload = match message.payload {
                //     PlutomiEventPayload::TOTPRequested(payload) => payload,
                //     _ => {
                //         logger.log(LogObject {
                //             level: LogLevel::Error,
                //             message: "Invalid payload for TOTPRequested".to_string(),
                //             _time: get_current_time(OffsetDateTime::now_utc()),
                //             error: None,
                //             request: None,
                //             response: None,
                //             data: Some(json!({ "payload": message.payload })),
                //         });
                //         return Err("Invalid payload for TOTPRequested".to_string());
                //     }
                // };

                // Send the email
                // send_email(payload.email).await?;
            }
            _ => {
                logger.log(LogObject {
                    level: LogLevel::Warn,
                    message: format!(
                        "Unknown event type {:?} in {:?}",
                        message.subject, consumer_name
                    ),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    error: None,
                    request: None,
                    response: None,
                    data: Some(json!({ "payload": message.payload })),
                });
            }
        }

        Ok(())
    })
}

fn handle_meta(
    MessageHandlerOptions {
        message,
        logger,
        jetstream_context,
        consumer_name,
    }: MessageHandlerOptions,
) -> BoxFuture<'_, Result<(), String>> {
    Box::pin(async move {
        logger.log(LogObject {
            level: LogLevel::Info,
            message: format!(
                "Processing {} message in {}",
                &message.subject, &consumer_name
            ),
            _time: get_current_time(OffsetDateTime::now_utc()),
            error: None,
            request: None,
            response: None,
            // TODO payload is in bytes, should be converted to string
            data: Some(json!({  "subject": &message.subject, "payload": &message.payload,})),
        });

        let payload = match serde_json::from_slice::<MaxDeliverAdvisory>(&message.payload) {
            Ok(payload) => payload,
            Err(e) => {
                // We are only listening for the MAX_DELIVERIES event
                // If we try to parse it (above), and it fails, that's an error
                // If it's because it's a different structure, then warn since we are not listening for it but it doesn't matter
                let is_max_delivery_advisory = &message
                    .subject
                    .contains("$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES");

                let default_err = format!("Unknown message in {} - skipping...", &consumer_name);
                let error_message = is_max_delivery_advisory
                    .then_some("Failed to parse max delivery advisory message")
                    .unwrap_or(&default_err);

                let log_level = is_max_delivery_advisory
                    .then_some(LogLevel::Error)
                    .unwrap_or(LogLevel::Warn);

                logger.log(LogObject {
                    level: log_level,
                    message: error_message.to_string(),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    error: Some(json!({ "error": e.to_string() })),
                    request: None,
                    response: None,
                    data: Some(json!({
                            "subject": message.subject,
                            "payload": message.payload })),
                });
                // Again, if it is a max delivery advisory, we return an error otherwise skip it
                // We don't care about other meta events
                return is_max_delivery_advisory
                    .then_some(Err(e.to_string()))
                    .unwrap_or(Ok(()));
            }
        };

        // Get the new stream prefix to put the event into (ie waterfall)
        let new_stream = match payload.stream.as_str() {
            "events" => "events-retry",
            "events-retry" => "events-dlq",
            _ => {
                let msg = format!("Unknown stream fallback: {}", payload.stream);
                logger.log(LogObject {
                    level: LogLevel::Error,
                    message: msg.clone(),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    error: None,
                    request: None,
                    response: None,
                    data: Some(json!({ "payload": payload })),
                });
                return Err(msg);
            }
        };

        publish_event(PublishEventOptions {
            jetstream_context,
            // events-retry.email-consumer etc.
            stream_name: format!("{}.{}", new_stream, &payload.consumer),
            headers: None,
            event: Some(&message.payload),
        })
        .await
        .map_err(|e| {
            logger.log(LogObject {
                level: LogLevel::Error,
                message: format!("Failed to publish meta event to {}", new_stream),
                _time: get_current_time(OffsetDateTime::now_utc()),
                error: Some(json!({ "error": e })),
                request: None,
                response: None,
                data: Some(json!({ "payload": payload })),
            });

            // Return the error to the caller
            e
        })?;

        Ok(())
    })
}
