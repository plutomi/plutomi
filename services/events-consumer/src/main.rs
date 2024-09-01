use async_nats::jetstream::Context;
use async_nats::jetstream::{self, consumer::Consumer, Message};
use base64::{engine, Engine}; // Add this to the top with your imports
use bytes::Bytes;
use dotenv::dotenv;
use futures::future::BoxFuture;
use futures::stream::StreamExt;
use serde_json::json;
use shared::events::{MaxDeliverAdvisory, PlutomiEvent};
use shared::get_current_time::get_current_time;
use shared::logger::{LogLevel, LogObject, Logger, LoggerContext};
use shared::nats::{
    connect_to_nats, create_stream, publish_event, ConnectToNatsOptions, CreateStreamOptions,
    PublishEventOptions,
};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use time::OffsetDateTime;
use tokio::task::JoinHandle;

mod config;

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

    let config = config::Config::new();

    let logger = Logger::init(LoggerContext {
        caller: &config.app_name,
    });

    // TODO: Add nats url to secrets

    let jetstream_context = connect_to_nats(ConnectToNatsOptions {
        logger: Arc::clone(&logger),
    })
    .await?;

    // Create all streams
    let streams: HashMap<String, Arc<jetstream::stream::Stream>> =
        futures::future::try_join_all(config.streams.iter().map(|stream_config| {
            create_stream(CreateStreamOptions {
                jetstream_context: &jetstream_context,
                stream_name: stream_config.name.clone(),
                subjects: stream_config.subjects.clone(),
            })
        }))
        .await?
        .into_iter()
        .collect();

    // Create all consumers
    let consumer_handles: Vec<_> = config
        .consumers
        .iter()
        .map(|consumer_config| {
            let stream = Arc::clone(&streams[&consumer_config.stream]);
            spawn_consumer(ConsumerOptions {
                consumer_name: consumer_config.name.clone(),
                filter_subjects: consumer_config.filter_subjects.clone(),
                max_delivery_attempts: consumer_config.max_delivery_attempts,
                redeliver_after: consumer_config.redeliver_after_duration,
                stream,
                jetstream_context: Arc::clone(&jetstream_context),
                logger: Arc::clone(&logger),
                message_handler: get_message_handler(&consumer_config.name),
            })
        })
        .collect();

    // Run indefinitely
    let _ = futures::future::join_all(consumer_handles).await;

    tokio::signal::ctrl_c()
        .await
        .expect("Failed to wait for ctrl_c signal");

    tokio::signal::ctrl_c()
        .await
        .expect("Failed to wait for ctrl_c signal");

    Ok(())
}

struct GetConsumerInfoResult {
    consumer_name: String,
    consumer: Consumer<jetstream::consumer::pull::Config>,
}

// TODO move this to config and use directly
fn get_message_handler(consumer_name: &str) -> MessageHandler {
    match consumer_name {
        name if name.starts_with("meta") || name.starts_with("super-meta") => {
            Arc::new(meta_handler)
        }
        name if name.starts_with("notification") => Arc::new(send_email),
        _ => panic!("Unknown consumer type"),
    }
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
 * When handling retries & DLQ, we need to strip the suffix to get the original name in some cases
 */
fn base_consumer_or_stream_name(name: &str) -> &str {
    name.strip_suffix("-retry")
        .or_else(|| name.strip_suffix("-dlq"))
        .unwrap_or(name)
}

/**
 * While inside a message handler, check if a message is in the retry or DLQ stream
 * If it is, lookup the original event in the main'events' stream and return it
 * Otherwise, return the original message that was passed in
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
            let advisory: MaxDeliverAdvisory =
                serde_json::from_slice(&message.payload).map_err(|e| {
                    format!(
                        "Failed to parse max delivery advisory message in extract 2: {}",
                        e
                    )
                })?;

            // When using get_raw_message, the payload is base64 encoded
            let (subject, decoded_payload) =
                get_original_subject_and_payload_from_max_delivery_advisory(
                    jetstream_context,
                    &advisory,
                )
                .await?;

            (subject, decoded_payload)
        } else {
            // Return the passed in message
            (message.subject.to_string(), message.payload.clone())
        };

    logger.log(LogObject {
        level: LogLevel::Info,
        message: format!("JOSE DEBUG Trying to extract message from_jestream",),
        _time: get_current_time(OffsetDateTime::now_utc()),
        error: None,
        request: None,
        response: None,
        data: Some(json!({ "original_subject": original_subject.clone(), "original_payload": original_payload.clone() })),
    });

    let event = PlutomiEvent::from_jetstream(&original_subject, &original_payload)?;

    logger.log(LogObject {
        level: LogLevel::Info,
        message: format!("JOSE DEBUG EXTRACTED MESSAGE",),
        _time: get_current_time(OffsetDateTime::now_utc()),
        error: None,
        request: None,
        response: None,
        data: Some(json!({ "event": event })),
    });

    // Parse the payload based on the event type
    match event {
        PlutomiEvent::TOTPRequested(ps) => {
            logger.log(LogObject {
                level: LogLevel::Info,
                message: format!("JOSE DEBUG MATCHED EVENT",),
                _time: get_current_time(OffsetDateTime::now_utc()),
                error: None,
                request: None,
                response: None,
                data: Some(json!({ "payload": ps })),
            });

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
        let event: PlutomiEvent =
            extract_message(&message, Arc::clone(&logger), jetstream_context).await?;

        logger.log(LogObject {
            level: LogLevel::Info,
            message: format!(
                "Processing 1 {:?} message in {}",
                &event.event_type(), // TODO this should use the actual event subject / type instead of this i think for easier filtering
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

                if x.contains("crash") && !consumer_name.contains("dlq") {
                    // TODO is bug here, in retry consumer, does not send to DLQ
                    return Err("Email contains crash".to_string());
                } else {
                    logger.log(LogObject {
                        level: LogLevel::Info,
                        message: format!("Email sent to {} in DLQ", x),
                        _time: get_current_time(OffsetDateTime::now_utc()),
                        error: None,
                        request: None,
                        response: None,
                        data: None,
                    });
                }
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

/**
 * Given a Max delivery message, get the original PlutomiEvent from the stream as bytes
 */
async fn get_original_subject_and_payload_from_max_delivery_advisory(
    jetstream_context: &Context,
    payload: &MaxDeliverAdvisory,
) -> Result<(String, Bytes), String> {
    let stream = jetstream_context
        .get_stream(base_consumer_or_stream_name(&payload.stream))
        .await
        .map_err(|e| format!("Failed to get stream: {}", e))?;

    let original_message = stream
        .get_raw_message(payload.stream_seq)
        .await
        .map_err(|e| format!("Failed to get original message: {}", e))?;

    let decoded_payload = engine::general_purpose::STANDARD
        .decode(&original_message.payload)
        .map_err(|e| format!("Failed to decode base64 payload: {}", e))?;

    println!(
        "JOSE DEBUG, decoded payload in meta get previous advisory: {:?}",
        decoded_payload
    );

    Ok((original_message.subject, decoded_payload.into()))
}

async fn meta_get_previous_advisory(
    jetstream_context: &Context,
    payload: &MaxDeliverAdvisory,
) -> Result<MaxDeliverAdvisory, String> {
    print!("Attempting to parse..."); // HERE.

    let (subject, decoded_payload) =
        get_original_subject_and_payload_from_max_delivery_advisory(jetstream_context, payload)
            .await?;

    let original_max_delivery_advisory: MaxDeliverAdvisory =
        serde_json::from_slice(&decoded_payload).map_err(|e| {
            format!(
                "Failed to parse {} max delivery advisory message in extract 1: {}",
                subject, e
            )
        })?;

    Ok(original_max_delivery_advisory)
}
fn meta_handler(
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
                "Processing 2 {} message in {}",
                &message.subject, &consumer_name
            ),
            _time: get_current_time(OffsetDateTime::now_utc()),
            error: None,
            request: None,
            response: None,
            // TODO payload is in bytes, should be converted to string
            data: Some(json!({  "subject": &message.subject })),
        });

        if message.subject.to_string()
        // ! TODO: Simulate error on the meta-handler first pass TODO: Remove this
            == ("$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.events.notifications-consumer")
        {
            let x = serde_json::from_slice::<MaxDeliverAdvisory>(&message.payload).unwrap();
            logger.log(LogObject {
                level: LogLevel::Warn,
                message: format!(
                    "JOSE DEBUG SIMULATING ERROR - THROWING ON FIRST RETRY STREAM FOR CONSUMER {}",
                    &consumer_name
                ),
                _time: get_current_time(OffsetDateTime::now_utc()),
                error: None,
                request: None,
                response: None,
                data: Some(json!({
                    "subject": &message.subject,
                    "sequence": x.stream_seq,
                })),
            });
            return Err("TEST ERROR HERE".to_string());
        } else {
            logger.log(LogObject {
                level: LogLevel::Info,
                message: format!("JOSE DEBUG META consumer - NO ERROR - CONTINUING",),
                _time: get_current_time(OffsetDateTime::now_utc()),
                error: None,
                request: None,
                response: None,
                data: Some(json!({
                    "subject": &message.subject,
                    "payload": &message.payload,
                })),
            });
        }

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

        logger.log(LogObject {
            level: LogLevel::Info,
            message: format!("PARSED PAYLOAD",),
            _time: get_current_time(OffsetDateTime::now_utc()),
            error: None,
            request: None,
            response: None,
            data: Some(json!({
                "subject": &message.subject,
                "payload": &payload,
            })),
        });

        /* For advisories for the meta* consumers, We need a copy of the original advisory to pass down to the retry/dlq handlers. For example:
        1. notifications-consumer reaches max delivery attempts
        2. NATS sends a MAX_DELIVERIES advisory to the meta-consumer
        3. meta-consumer reaches max delivery attempts
        4. NATS sends a MAX_DELIVERIES advisory to the meta-consumer-retry
        5. The meta-consumer-retry needs to know the original message that failed, to properly send it down to the retry/dlq handlers.
            The message it receives will be the MAX_DELIVERIES advisory, not the original message. So when publishing, it would publish the MAX_DELIVERY advisory
            of the meta-consumer to the events-retry.meta-consumer-retry stream. This is wrong and it should be the original message sequence ID with the original consumer.

        If the current MAX_DELIVERIES advisory is for a business consumer like notifications-consumer, simply pass that down to the handler. TODO */

        // Get the new stream prefix to put the event into (ie waterfall)
        let (new_stream, new_consumer, new_payload): (&str, String, MaxDeliverAdvisory) =
            match payload.stream.as_str() {
                "events" => {
                    logger.log(LogObject {
                        level: LogLevel::Info,
                        message: "in events match clause".to_string(),
                        _time: get_current_time(OffsetDateTime::now_utc()),
                        error: None,
                        request: None,
                        response: None,
                        data: None,
                    });
                    // Get the original MaxDeliveryAdvisory from a business logic consumer if we're currently handling a meta-consumer* advisory
                    let message_to_use = if payload.consumer.contains("meta-consumer") {
                        meta_get_previous_advisory(&jetstream_context, &payload).await?
                    } else {
                        // Use the current message and send it downstream
                        payload.clone()
                    };

                    logger.log(LogObject {
                    level: LogLevel::Info,
                    message: "Moving message 1 from events to events-retry stream".to_string(),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    error: None,
                    request: None,
                    response: None,
                    data: Some(json!({ "payload": payload, "previous_advisory": message_to_use.clone() })),
                });

                    (
                        "events-retry",
                        format!(
                            "{}-retry",
                            base_consumer_or_stream_name(&message_to_use.consumer)
                        ),
                        message_to_use,
                    )
                }
                "events-retry" => {
                    logger.log(LogObject {
                        level: LogLevel::Info,
                        message: "in events-retry match clause".to_string(),
                        _time: get_current_time(OffsetDateTime::now_utc()),
                        error: None,
                        request: None,
                        response: None,
                        data: None,
                    });

                    // TODO new error is here, when it is processed by the retry consumer, in the meta consumer retry this fails parsing
                    // Issue is that we shouldnt be trying to get the previous max delivery advisory as there is none unless we CURRENTLy have a max delivery for a meta consumer
                    // Get the previous advisory from a meta-consumer logic consumer
                    // Get the original MaxDeliveryAdvisory from a business logic consumer if we're currently handling a meta-consumer* advisory
                    let message_to_use = if payload.consumer.contains("meta-consumer") {
                        let previous_max_delivery_advisory =
                            meta_get_previous_advisory(&jetstream_context, &payload).await?;

                        logger.log(LogObject {
                            level: LogLevel::Info,
                            message: "Got previous max delivery advisory, one more to go".to_string(),
                            _time: get_current_time(OffsetDateTime::now_utc()),
                            error: None,
                            request: None,
                            response: None,
                            data: Some(json!({ "previous_max_delivery_advisory": previous_max_delivery_advisory })),
                        });
                        // Get the original advisory from a meta-consumer logic consumer
                        let original_max_delivery_advisory = meta_get_previous_advisory(
                            &jetstream_context,
                            &previous_max_delivery_advisory,
                        )
                        .await?;

                        logger.log(LogObject {
                            level: LogLevel::Info,
                            message: "Got original max delivery advisory".to_string(),
                            _time: get_current_time(OffsetDateTime::now_utc()),
                            error: None,
                            request: None,
                            response: None,
                            data: Some(json!({ "original_max_delivery_adivisory": original_max_delivery_advisory })),
                        });

                        original_max_delivery_advisory
                    } else {
                        // Use the current message and send it downstream
                        payload.clone()
                    };

                    logger.log(LogObject {
                    level: LogLevel::Info,
                    message: "Moving message 2 from events-retry to events-dlq stream".to_string(),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    error: None,
                    request: None,
                    response: None,
                    data: Some(json!({ "payload": payload, "previous_advisory": message_to_use, "original_max_delivery_advisory": message_to_use.clone() }))
                });

                    (
                        "events-dlq",
                        format!(
                            "{}-dlq",
                            base_consumer_or_stream_name(&message_to_use.consumer)
                        ),
                        message_to_use,
                    )
                }
                "events-dlq" => {
                    logger.log(LogObject {
                        level: LogLevel::Info,
                        message: "in events-dlq match clause".to_string(),
                        _time: get_current_time(OffsetDateTime::now_utc()),
                        error: None,
                        request: None,
                        response: None,
                        data: None,
                    });

                    // Get the previous advisory from a meta-consumer-retry logic consumer
                    let message_to_use = if payload.consumer.contains("meta-consumer") {
                        let previous_max_delivery_advisory =
                            meta_get_previous_advisory(&jetstream_context, &payload).await?;

                        // Get the first advisory from a meta-consumer logic consumer
                        let first_max_delivery_advisory = meta_get_previous_advisory(
                            &jetstream_context,
                            &previous_max_delivery_advisory,
                        )
                        .await?;

                        // Get the original advisory from a meta-consumer logic consumer
                        let original_max_delivery_advisory = meta_get_previous_advisory(
                            &jetstream_context,
                            &first_max_delivery_advisory,
                        )
                        .await?;

                        original_max_delivery_advisory
                    } else {
                        payload.clone()
                    };

                    // Do nothing for now, just log
                    logger.log(LogObject {
                        level: LogLevel::Warn,
                        message:
                            "Message has reached max delivery attempts and will not be retried "
                                .to_string(),
                        _time: get_current_time(OffsetDateTime::now_utc()),
                        error: None,
                        request: None,
                        response: None,
                        data: Some(json!({ "payload": payload, })),
                    });

                    return Ok(());
                }
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

        let pub_fn_stream = format!("{}.{}", new_stream, new_consumer);
        logger.log(LogObject {
            level: LogLevel::Info,
            message: format!("Publish function using stream: {}", pub_fn_stream),
            _time: get_current_time(OffsetDateTime::now_utc()),
            error: None,
            request: None,
            response: None,
            data: Some(json!({ "payload": new_payload })),
        });

        publish_event(PublishEventOptions {
            jetstream_context,
            // events-retry.email-consumer etc.
            stream_name: pub_fn_stream,
            headers: None,
            event: Some(&new_payload),
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
