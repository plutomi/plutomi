use async_nats::jetstream::consumer;
use async_nats::jetstream::{self, consumer::Consumer, Message};
use dotenv::dotenv;
use futures::future::BoxFuture;
use futures::stream::StreamExt;
use serde_json::json;
use shared::events::PlutomiEventTypes;
use shared::get_current_time::get_current_time;
use shared::logger::{self, LogLevel, LogObject, Logger, LoggerContext};
use shared::nats::{connect_to_nats, create_stream, CreateStreamOptions};
use std::sync::Arc;
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

async fn run_consumer(
    mut consumer: Consumer<jetstream::consumer::pull::Config>,
    message_handler: MessageHandler,
    logger: Arc<Logger>,
) -> Result<(), String> {
    // Fetch the info once on start
    let consumer_info = consumer.info().await.map_err(|e| {
        let msg = format!("Error getting consumer info: {}", e);
        logger.log(LogObject {
            level: LogLevel::Error,
            message: msg.clone(),
            error: Some(json!({ "error": e.to_string() })),
            _time: get_current_time(OffsetDateTime::now_utc()),
            request: None,
            response: None,
            data: None,
        });
        msg
    })?;

    let consumer_name = consumer_info
        .config
        .name
        .as_deref()
        .unwrap_or("unknown-consumer-name")
        .to_string();

    logger.log(LogObject {
        level: LogLevel::Info,
        message: format!("{} started", consumer_name),
        error: None,
        _time: get_current_time(OffsetDateTime::now_utc()),
        request: None,
        response: None,
        data: None,
    });

    loop {
        println!("Waiting for messages...");
        let mut messages = match consumer.messages().await {
            Ok(msgs) => msgs,
            Err(e) => {
                eprintln!("Failed to get messages: {}. Retrying in 1 second", e);
                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                continue;
            }
        };

        println!("Entering message processing loop");
        while let Some(message_result) = messages.next().await {
            match message_result {
                Ok(message) => {
                    println!("Received a message on subject: {}", message.subject);
                    if let Err(e) = message_handler(&message).await {
                        eprintln!("Error processing message: {}", e);
                        return Err(e);
                    }
                    if let Err(e) = message.ack().await {
                        eprintln!("Failed to acknowledge message: {}", e);
                    }
                }
                Err(e) => {
                    eprintln!("Error receiving message: {}", e);
                    return Err(e.to_string());
                }
            }
        }
        println!("No more messages in batch. Looping back to fetch more.");
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
            if let Err(e) = run_consumer(consumer, message_handler.clone()).await {
                logger.log(LogObject {
                    level: LogLevel::Error,
                    message: format!(
                        "Consumer error - restarting in {:?} seconds",
                        RESTART_ON_ERROR_DURATION
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
