use async_nats::jetstream::{self, consumer::Consumer, Message};
use dotenv::dotenv;
use futures::future::BoxFuture;
use futures::stream::StreamExt;
use shared::events::PlutomiEventTypes;
use shared::logger::{LogLevel, LogObject, Logger};
use shared::nats::{connect_to_nats, create_stream, CreateStreamOptions};
use std::sync::Arc;
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
    let consumer_handles: Vec<_> = consumer_configs.into_iter().map(spawn_consumer).collect();

    // Wait for the consumers to start and run indefinitely
    let _ = futures::future::join_all(consumer_handles).await;

    tokio::signal::ctrl_c()
        .await
        .expect("Failed to wait for ctrl_c signal");

    Ok(())
}

async fn run_consumer(
    consumer: Consumer<jetstream::consumer::pull::Config>,
    message_handler: MessageHandler,
) -> Result<(), String> {
    println!("Consumer started");
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
            println!("Setting up consumer: {}", &consumer_name);
            let consumer = match stream
                .get_or_create_consumer(
                    &consumer_name,
                    jetstream::consumer::pull::Config {
                        durable_name: Some(consumer_name.clone()),
                        filter_subjects: consumer_subjects.clone(),
                        name: Some(consumer_name.clone()),
                        ..Default::default()
                    },
                )
                .await
            {
                Ok(consumer) => consumer,
                Err(e) => {
                    eprintln!("Failed to create consumer: {}. Retrying...", e);
                    return;
                }
            };

            println!("Consumer {} created", &consumer_name);

            // Run the consumer
            if let Err(e) = run_consumer(consumer, message_handler.clone()).await {
                eprintln!(
                    "{} consumer error: {}. Restarting in 5 seconds...",
                    &consumer_name, e
                );
                tokio::time::sleep(RESTART_ON_ERROR_DURATION).await;
            }
            // tokio::time::sleep(RESTART_ON_ERROR_DURATION).await;
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
