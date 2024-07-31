use async_nats::jetstream::{self, consumer::Consumer, Message};
use futures::future::{try_join_all, BoxFuture};
use futures::stream::StreamExt;
use shared::events::PlutomiEventTypes;
use shared::get_current_time::get_current_time;
use shared::logger::{LogLevel, LogObject, Logger};
use shared::nats::{connect_to_nats, create_stream, CreateStreamOptions};
use std::str::from_utf8;
use std::sync::Arc;
use time::OffsetDateTime;
use tokio::sync::Mutex;
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

const EMAIL_CONSUMER_NAME: &str = "email-consumer";

// type MessageHandler = Arc<dyn Fn(&Message) -> BoxFuture<'_, Result<(), String>> + Send + Sync>;

type MessageHandler = Arc<dyn Fn(&Message) -> BoxFuture<'_, Result<(), String>> + Send + Sync>;

#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), String> {
    // Setup logging
    let logger = Logger::new();

    // TODO: Add nats url to secrets

    // Connect to the NATS server
    let jetstream = connect_to_nats("nats://localhost:4222").await?;

    // Create the event stream if it doesn't exist
    let event_stream = create_stream(CreateStreamOptions {
        jetstream: &jetstream,
        subjects: None,
    })
    .await?;

    // Define all consumers
    let consumer_configs: Vec<ConsumerOptions> = vec![
        // Email consumer
        ConsumerOptions {
            consumer_name: EMAIL_CONSUMER_NAME.to_string(),
            consumer_subjects: vec![PlutomiEventTypes::TOTPRequested.as_string()],
            stream: &event_stream,
            message_handler: Arc::new(send_email),
        },
    ];

    // // Spawn consumers
    // let consumer_handles = consumer_configs
    //     .into_iter()
    //     .map(spawn_consumer)
    //     .collect::<Result<Vec<_>, _>>()?;

    // // Wait for all consumers to complete (which they shouldn't under normal circumstances)
    // Map to futures and collect results
    let consumer_futures = consumer_configs
        .into_iter()
        .map(spawn_consumer)
        .collect::<Vec<_>>();

    // Use `future::try_join_all` to await all futures and collect their results
    let consumer_handles = try_join_all(consumer_futures).await?;

    // Wait for all consumers to complete (which they shouldn't under normal circumstances)
    tokio::join!(consumer_handles).await?;

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

struct ConsumerOptions<'a> {
    // A reference to the event stream to create the consumer on
    stream: &'a jetstream::stream::Stream,
    consumer_name: String,
    // What events the consumer will listen to
    consumer_subjects: Vec<String>,
    message_handler: MessageHandler,
}

async fn spawn_consumer<'a>(
    ConsumerOptions {
        stream,
        consumer_name,
        consumer_subjects,
        message_handler,
    }: ConsumerOptions<'a>,
) -> Result<JoinHandle<()>, String> {
    let consumer = stream
        .get_or_create_consumer(
            &consumer_name,
            jetstream::consumer::pull::Config {
                durable_name: Some(consumer_name.clone()),
                filter_subjects: consumer_subjects,
                ..Default::default()
            },
        )
        .await
        .map_err(|e| {
            format!(
                "An error occurred setting up the {} consumer: {}",
                &consumer_name, e
            )
        })?;

    let consumer_handler = tokio::spawn(async move {
        loop {
            match run_consumer(consumer.clone(), message_handler.clone()).await {
                Ok(()) => {
                    // TODO better logging
                    // TODO Shouldn't happen
                    info!("{} consumer exited successfully", &options.consumer_name);
                    break;
                }
                Err(e) => {
                    // TODO better logging
                    let error_msg =
                        format!("{} consumer error: {}. Restarting...", &consumer_name, e);
                    eprintln!("{}", error_msg);
                    tokio::time::sleep(std::time::Duration::from_secs(5)).await;
                }
            }
        }
    });

    Ok(consumer_handler)
}

fn send_email(message: &Message) -> BoxFuture<'_, Result<(), String>> {
    Box::pin(async move {
        // Send email
        println!("Sending email for event {}", message.subject);
        Ok(())
    })
}
