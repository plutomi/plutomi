use async_nats::jetstream::{self, consumer::Consumer, Message};
use dotenv::dotenv;
use futures::future::BoxFuture;
use futures::stream::StreamExt;
use shared::events::PlutomiEventTypes;
use shared::get_current_time::get_current_time;
use shared::logger::{LogLevel, LogObject, Logger};
use shared::nats::{connect_to_nats, create_stream, CreateStreamOptions};
use std::str::from_utf8;
use std::sync::Arc;
use time::OffsetDateTime;
use tokio::task::JoinHandle;

// TODO: Acceptance criteria
// - [ ] Can read .env parsed
// - [ ] Can connect to MongoDB
// - [ ] Can log messages
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
    // Setup logging
    let logger = Logger::new();

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

    // Define all consumers
    let consumer_configs: Vec<ConsumerOptions> = vec![
        // Email consumer
        ConsumerOptions {
            consumer_name: String::from("email-consumer"),
            consumer_subjects: vec![PlutomiEventTypes::TOTPRequested]
                .into_iter()
                .map(|e| e.as_string())
                .collect(),
            stream: Arc::clone(&event_stream),
            message_handler: Arc::new(send_email),
        },
    ];

    // Spawn all consumers concurrently
    let consumer_handles = consumer_configs.into_iter().map(spawn_consumer);

    // Wait for all consumers to finish (which should never happen in normal operation)
    futures::future::join_all(consumer_handles).await;

    // Should never run
    logger.log(LogObject {
        level: LogLevel::Info,
        message: "All consumers have exited successfully".to_string(),
        data: None,
        error: None,
        request: None,
        response: None,
        _time: get_current_time(OffsetDateTime::now_utc()),
    });

    Ok(())
}

async fn run_consumer(
    consumer: Consumer<jetstream::consumer::pull::Config>,
    message_handler: MessageHandler,
) -> Result<(), String> {
    loop {
        let mut messages = consumer
            .messages()
            .await
            .map_err(|e| format!("Failed to get messages: {}", e))?;

        while let Some(message) = messages.next().await {
            let message = message.map_err(|e| format!("Failed to get message: {}", e))?;

            println!(
                "got message on subject {} with payload {:?}",
                message.subject,
                from_utf8(&message.payload).map_err(|e| format!("Invalid UTF-8: {}", e))?
            );

            message_handler(&message)
                .await
                .map_err(|e| format!("Message handler failed: {}", e))?;

            message
                .ack()
                .await
                .map_err(|e| format!("Failed to ack message: {}", e))?;
        }
    }
}

struct ConsumerOptions {
    // A reference to the event stream to create the consumer on
    stream: Arc<jetstream::stream::Stream>,
    consumer_name: String,
    // What events the consumer will listen to
    consumer_subjects: Vec<String>,
    message_handler: MessageHandler,
}

const RESTART_ON_ERROR_DURATION: std::time::Duration = std::time::Duration::from_secs(5);

async fn spawn_consumer(
    ConsumerOptions {
        stream,
        consumer_name,
        consumer_subjects,
        message_handler,
    }: ConsumerOptions,
) -> JoinHandle<()> {
    tokio::spawn(async move {
        loop {
            // Attempt to create the consumer
            let consumer = match stream
                .get_or_create_consumer(
                    &consumer_name,
                    jetstream::consumer::pull::Config {
                        durable_name: Some(consumer_name.clone()),
                        filter_subjects: consumer_subjects.clone(),
                        ..Default::default()
                    },
                )
                .await
            {
                Ok(consumer) => consumer,
                Err(e) => {
                    eprintln!(
                        "Error setting up the {} consumer: {}. Retrying in 5 seconds...",
                        &consumer_name, e
                    );
                    tokio::time::sleep(RESTART_ON_ERROR_DURATION).await;
                    continue;
                }
            };

            // Run the consumer
            if let Err(e) = run_consumer(consumer, message_handler.clone()).await {
                eprintln!(
                    "{} consumer error: {}. Restarting in 5 seconds...",
                    &consumer_name, e
                );
                tokio::time::sleep(RESTART_ON_ERROR_DURATION).await;
            }
        }
    })
}

fn send_email(message: &Message) -> BoxFuture<'_, Result<(), String>> {
    Box::pin(async move {
        // Send email
        println!("Sending email for event {}", message.subject);
        Ok(())
    })
}
