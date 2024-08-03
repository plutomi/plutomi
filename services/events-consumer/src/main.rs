use async_nats::jetstream::{self, consumer::Consumer, Message};
use dotenv::dotenv;
use futures::future::BoxFuture;
use futures::stream::StreamExt;
use serde_json::json;
use shared::events::PlutomiEventTypes;
use shared::get_current_time::get_current_time;
use shared::logger::{LogLevel, LogObject, Logger, LoggerContext};
use shared::nats::{connect_to_nats, create_stream, CreateStreamOptions};
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

type MessageHandler = Arc<dyn Fn(&Message) -> BoxFuture<'_, Result<(), String>> + Send + Sync>;

#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), String> {
    dotenv().ok();

    let logger = Logger::new(LoggerContext {
        caller: "events-consumer",
    });

    // TODO: Add nats url to secrets

    // Connect to the NATS server
    let jetstream = connect_to_nats().await?;

    // Create the event stream if it doesn't exist
    let event_stream = Arc::new(
        create_stream(CreateStreamOptions {
            jetstream: &jetstream,
            subjects: None,
        })
        .await?,
    );

    let consumer_configs: Vec<ConsumerOptions> = vec![
        // Email consumer
        ConsumerOptions {
            consumer_name: String::from("email-consumer"),
            filter_subjects: vec![PlutomiEventTypes::TOTPRequested.as_string()],
            stream: Arc::clone(&event_stream),
            message_handler: Arc::new(send_email),
            logger: Arc::clone(&logger),
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

async fn run_consumer(
    consumer: Consumer<jetstream::consumer::pull::Config>,
    message_handler: MessageHandler,
    logger: Arc<Logger>,
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
                logger.log(LogObject {
                    level: LogLevel::Error,
                    message: format!(
                        "Failed to get message stream in {} - restarting in {:?}",
                        &consumer_name, FETCH_EVENT_STREAM_RESTART_DURATION
                    ),
                    error: Some(json!({ "error": e.to_string() })),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    request: None,
                    response: None,
                    data: None,
                });
                tokio::time::sleep(FETCH_EVENT_STREAM_RESTART_DURATION).await;
                continue;
            }
        };

        while let Some(message_result) = messages.next().await {
            match message_result {
                Ok(message) => {
                    logger.log(LogObject {
                        level: LogLevel::Debug,
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
                    if let Err(e) = message_handler(&message).await {
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
                        return Err(e);
                    } else {
                        logger.log(LogObject {
                            level: LogLevel::Debug,
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

                    if let Err(e) = message.ack().await {
                        logger.log(LogObject {
                            level: LogLevel::Error,
                            message: format!(
                                "Error acknowledging message {} in {}",
                                &message.subject, &consumer_name
                            ),
                            error: Some(json!({ "error": e.to_string() })),
                            _time: get_current_time(OffsetDateTime::now_utc()),
                            request: None,
                            response: None,
                            data: None,
                        }); // TODO return error?
                    } else {
                        logger.log(LogObject {
                            level: LogLevel::Debug,
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
                Err(e) => {
                    eprintln!("Error receiving message: {}", e);
                    return Err(e.to_string());
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
}

const RESTART_ON_ERROR_DURATION: std::time::Duration = std::time::Duration::from_secs(5);
const FETCH_EVENT_STREAM_RESTART_DURATION: std::time::Duration = std::time::Duration::from_secs(5);

async fn spawn_consumer(
    ConsumerOptions {
        stream,
        consumer_name,
        filter_subjects,
        message_handler,
        logger,
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
            if let Err(e) = run_consumer(consumer, message_handler.clone(), logger.clone()).await {
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

fn send_email(message: &Message) -> BoxFuture<'_, Result<(), String>> {
    Box::pin(async move {
        // Send email

        if (String::from_utf8(message.payload.to_vec()))
            .unwrap()
            .contains("crash")
        {
            return Err("Crash detected".to_string());
        };
        // println!("SEM evnet: {:?}", message);
        println!("Sending email for event {}", message.subject);
        Ok(())
    })
}
