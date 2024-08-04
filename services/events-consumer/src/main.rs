use async_nats::jetstream::{self, consumer::Consumer, Message};
use dotenv::dotenv;
use futures::future::BoxFuture;
use futures::stream::StreamExt;
use serde_json::json;
use shared::events::{PlutomiEventPayload, PlutomiEventTypes};
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

    let jetstream = connect_to_nats(ConnectToNatsOptions {
        logger: Arc::clone(&logger),
    })
    .await?;

    let stream_configs: Vec<CreateStreamOptions> = vec![
        // Main events stream for all messages
        // events.totp.requested or events.email.sent
        CreateStreamOptions {
            jetstream: &jetstream,
            stream_name: "events".to_string(),
            subjects: vec!["events.>".to_string()],
        },
        // The format here is consumer based: events-retry.consumer-name
        // That way we only retry messages that failed for a specific consumer
        // ie: SES is down, don't resend the message to ClickHouse or MeiliSearch consumers
        // The logic here doesn't change, but the retry backoff does
        CreateStreamOptions {
            jetstream: &jetstream,
            stream_name: "events-retry".to_string(),
            subjects: vec!["events-retry.>".to_string()],
        },
        // DLQ for messages that have failed too many times and require manual intervention
        // Same formats as the retry stream: events-dlq.consumer-name
        CreateStreamOptions {
            jetstream: &jetstream,
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
            logger: Arc::clone(&logger),
            message_handler: Arc::new(handle_meta),
            max_delivery_attempts: 10000, // Kind of crucial to handle retries
            redeliver_after: Duration::from_secs(2),
        },
        ConsumerOptions {
            consumer_name: String::from("email-consumer"),
            filter_subjects: vec![PlutomiEventTypes::TOTPRequested.as_string()],
            stream: Arc::clone(&streams["events"]),
            logger: Arc::clone(&logger),
            message_handler: Arc::new(send_email),
            max_delivery_attempts: 3,
            redeliver_after: Duration::from_secs(5),
        },
        ConsumerOptions {
            consumer_name: String::from("retry-email-consumer"),
            filter_subjects: vec![String::from("events-retry.email-consumer")],
            stream: Arc::clone(&streams["events-retry"]),
            logger: Arc::clone(&logger),
            message_handler: Arc::new(send_email),
            max_delivery_attempts: 5,
            redeliver_after: Duration::from_secs(5),
        },
        ConsumerOptions {
            consumer_name: String::from("dlq-email-consumer"),
            filter_subjects: vec![String::from("events-dlq.email-consumer")],
            stream: Arc::clone(&streams["events-dlq"]),
            logger: Arc::clone(&logger),
            message_handler: Arc::new(send_email),
            max_delivery_attempts: 10,
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
}
async fn run_consumer(
    RunConsumerOptions {
        consumer,
        message_handler,
        logger,
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
                            "Processing message {} in {} ",
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

fn send_email(
    MessageHandlerOptions { message, logger }: MessageHandlerOptions,
) -> BoxFuture<'_, Result<(), String>> {
    Box::pin(async move {
        // Send email
        if (String::from_utf8(message.payload.to_vec()))
            .unwrap()
            .contains("crash")
        {
            return Err("Crash detected".to_string());
        };
        logger.log(LogObject {
            level: LogLevel::Info,
            message: format!("Sending email for event {}", message.subject),
            error: None,
            _time: get_current_time(OffsetDateTime::now_utc()),
            request: None,
            response: None,
            data: None,
        });
        Ok(())
    })
}

fn handle_meta(
    MessageHandlerOptions { message, logger }: MessageHandlerOptions,
) -> BoxFuture<'_, Result<(), String>> {
    Box::pin(async move {
        logger.log(LogObject {
            level: LogLevel::Info,
            message: format!("Handling meta event: {:?}", message),
            _time: get_current_time(OffsetDateTime::now_utc()),
            error: None,
            request: None,
            response: None,
            data: None,
        });

        // TODO: Fetch message using message_id
        
        // 
        publish_event(PublishEventOptions {
            jetstream: message, // TODO,,
            stream_name: "events-retry".to_string(),
            event: PlutomiEventPayload {
                event_type: PlutomiEventTypes::TOTPRequested,
                payload: json!({ "message": "retry" }),
            },
        });

        Ok(())
    })
}
