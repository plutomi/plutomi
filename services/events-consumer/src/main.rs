use core::panic;
use std::fmt::format;
use std::os::unix::process;
use std::pin::Pin;
use std::str::{from_utf8, FromStr};
use std::sync::Arc;

use async_nats::jetstream::consumer::{Config, Consumer, PullConsumer};
use async_nats::jetstream::stream::Stream;
use async_nats::jetstream::{self, Message};
use async_nats::{client, Client};
use futures::future::BoxFuture;
use futures::stream::StreamExt;
use futures::Future;
use serde_json::json;

use shared::constants::EVENT_STREAM_NAME;
use shared::entities::Entities;
use shared::events::PlutomiEventTypes;
use shared::get_current_time::get_current_time;
use shared::logger::{LogLevel, LogObject, Logger};
use shared::nats::{connect_to_nats, create_stream, CreateStreamOptions};
use time::OffsetDateTime;
use tokio::sync::{mpsc, Mutex};
use tokio::task::{self, JoinHandle};
use tracing::{info, warn};

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

mod create_consumer;
use create_consumer::{create_consumer, SetupConsumerOptions};

const EMAIL_CONSUMER_NAME: &str = "email-consumer";

type MessageHandler = Arc<dyn Fn(&Message) -> BoxFuture<'_, Result<(), String>> + Send + Sync>;

#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), String> {
    // Setup logging
    let logger = Logger::new();

    // Create a NATS client
    // Connect to the NATS server
    // TODO: Add nats url to secrets

    // Connect to the NATS server
    let jetstream = connect_to_nats("nats://localhost:4222").await?;

    // Create the event stream if it doesn't exist
    let event_stream = create_stream(CreateStreamOptions {
        jetstream: &jetstream,
        subjects: None
    });

    let email_consumer = create_consumer(SetupConsumerOptions {
        stream: &stream,
        name: EMAIL_CONSUMER_NAME,
        subjects: vec![PlutomiEventTypes::TOTPRequested.as_string()],
    })
    .await
    .unwrap_or_else(|e| panic!("{}", e));

    let consumer_statuses = Arc::new(Mutex::new(vec![]));

    let email_handler = spawn_consumer(
        email_consumer,
        Arc::new(send_email),
        "Email".to_string(),
        Arc::clone(&consumer_statuses),
    );

    // Wait for all consumers to complete (which they shouldn't under normal circumstances)
    let (email_result,) = tokio::join!(email_handler);

    // Handle any errors
    // Handle email handler errors
    if let Err(e) = email_result {
        eprintln!("An error occurred in the email handler: {:?}", e);
    }

    // Log final statuses
    // TODO better logging
    let statuses = consumer_statuses.lock().await;
    for status in statuses.iter() {
        println!("{}", status);
    }

    // TODO better logging
    println!("All consumers have stopped. Exiting.");

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

fn spawn_consumer(
    consumer: Consumer<jetstream::consumer::pull::Config>,
    message_handler: MessageHandler,
    name: String,
    statuses: Arc<Mutex<Vec<String>>>,
) -> JoinHandle<()> {
    tokio::spawn(async move {
        loop {
            match run_consumer(consumer.clone(), message_handler.clone()).await {
                Ok(()) => {
                    // TODO better logging
                    // This shouldn't happen as run_consumer loops indefinitely
                    let mut statuses = statuses.lock().await;
                    statuses.push(format!("{} consumer exited successfully", name));
                    break;
                }
                Err(e) => {
                    // TODO better logging
                    let error_msg = format!("{} consumer error: {}. Restarting...", name, e);
                    eprintln!("{}", error_msg);
                    let mut statuses = statuses.lock().await;
                    statuses.push(error_msg);
                    tokio::time::sleep(std::time::Duration::from_secs(5)).await;
                }
            }
        }
    })
}

fn send_email(message: &Message) -> BoxFuture<'_, Result<(), ()>> {
    Box::pin(async move {
        // Send email
        println!("Sending email for event {}", message.subject);
        Ok(())
    })
}
