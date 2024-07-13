use core::panic;
use std::os::unix::process;
use std::str::FromStr;
use std::sync::Arc;

use async_nats::jetstream::consumer::PullConsumer;
use async_nats::jetstream::{self, Message};
use async_nats::{client, Client};
use futures::stream::StreamExt;
use serde_json::json;
use shared::entities::Entities;
use shared::events::PlutomiEvents;
use shared::get_current_time::get_current_time;
use shared::logger::{LogLevel, LogObject, Logger};
use time::OffsetDateTime;
use tokio::sync::mpsc;
use tokio::task;
use tracing::{info, warn};

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    // Setup logging
    let logger = Logger::new();
    info!("Logger initialized in events-consumer");

    // TODO: Acceptance criteria
    // - [ ] Can read .env parsed
    // - [ ] Can connect to MongoDB
    // - [ ] Can log messages
    // - [ ] Can consume events / consumer groups
    // - [ ] Can process/ publish  events
    // - [ ] Can generate ids with shared lib
    // Create a NATS client
    // Connect to the NATS server
    // TODO: Add nats url
    let nats_client = async_nats::connect("nats://localhost:4222").await.unwrap();
    let jetstream = async_nats::jetstream::new(nats_client);

    let stream_name = String::from("EVENTS");

    let stream = jetstream
        .get_or_create_stream(jetstream::stream::Config {
            name: stream_name,
            subjects: vec!["events.>".to_string()],
            storage: jetstream::stream::StorageType::File,
            ..Default::default()
        })
        .await
        .unwrap_or_else(|error| {
            let error_json = json!({
                "error": error.to_string(),
            });

            logger.log(LogObject {
                level: LogLevel::Error,
                _time: get_current_time(OffsetDateTime::now_utc()),
                message: "Failed to create stream in events-consumer".to_string(),
                data: None,
                error: Some(error_json),
                request: None,
                response: None,
            });
            std::process::exit(1);
        });

    let consumer = stream
        .create_consumer(jetstream::consumer::pull::Config {
            durable_name: Some("events-consumer".to_string()),
            ..Default::default()
        })
        .await
        .unwrap_or_else(|error| {
            let error_json = json!({
                "error": error.to_string(),
            });

            logger.log(LogObject {
                level: LogLevel::Error,
                _time: get_current_time(OffsetDateTime::now_utc()),
                message: "Failed to create consumer in events--consumer".to_string(),
                data: None,
                error: Some(error_json),
                request: None,
                response: None,
            });
            std::process::exit(1);
        });

    // Create channels for each handler with their respective receivers and senders
    let (tx_notifications, rx_notifications) = mpsc::unbounded_channel();
    let (tx_webhooks, rx_webhooks) = mpsc::unbounded_channel();

    // Spawn the handlers
    let notifications_handler = tokio::spawn(handle_notifications(rx_notifications));
    let webhooks_handler = tokio::spawn(handle_webhooks(rx_webhooks));

    // Await the tasks to complete (in practice, handle shutdowns gracefully)
    let _ = tokio::join!(notifications_handler, webhooks_handler);

    loop {
        let mut messages = consumer
            .fetch()
            // Adjust as necessary
            .max_messages(1)
            .messages()
            .await
            .unwrap_or_else(|error| {
                let error_json = json!({
                    "error": error.to_string(),
                });

                logger.log(LogObject {
                    level: LogLevel::Error,
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    message: "Failed to fetch messages in events-consumer".to_string(),
                    data: None,
                    error: Some(error_json),
                    request: None,
                    response: None,
                });
                std::process::exit(1);
            });

        while let Some(message_result) = messages.next().await {
            if let Ok(payload) = serde_json::from_slice::<Payload>(message.payload.as_ref()) {
                println!(
                    "received valid JSON payload: foo={:?} bar={:?}",
                    payload.foo, payload.bar
                );
            } else {
                println!("received invalid JSON payload: {:?}", message.payload);
            }

            let message = message_result.unwrap_or_else(|error| {
                let error_json = json!({
                    "error": error.to_string(),
                });

                logger.log(LogObject {
                    level: LogLevel::Error,
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    message: "Failed to fetch message in events-consumer".to_string(),
                    data: None,
                    error: Some(error_json),
                    request: None,
                    response: None,
                });
                std::process::exit(1);
            });

            logger.log(LogObject {
                level: LogLevel::Info,
                _time: get_current_time(OffsetDateTime::now_utc()),
                message: "Received message".to_string(),
                data: Some(json!({
                    "message": message,
                })),
                error: None,
                request: None,
                response: None,
            });

            // // Acknowledge the message
            // message.ack().await.unwrap(); // Handle this unwrap better in production

            // Based on the content of the message or its subject, decide where to send it
            match PlutomiEvents::from_str(&message.subject) {
                Ok(PlutomiEvents::TOTPRequested) => {
                    tx_notifications.send(message); // Handle this unwrap better in production
                }
                Ok(PlutomiEvents::TOTPVerified) => {
                    tx_webhooks.send(message);
                }
                Err(_) => {
                    // Handle unknown or misrouted event types
                    println!("Unknown or unsupported event type received.");
                }
            }
        }
    }

    // let messages  = consumer.messages().await.
    // // TODO: Move this to its own thread as well
    // while let Some(message) = consumer.messages().await {
    //     match PlutomiEvents::from_str(&message.subject) {
    //         Ok(PlutomiEvents::TOTPRequested) => {
    //             tx_notifications.send(message);
    //         }
    //         Ok(PlutomiEvents::TOTPVerified) => {
    //             tx_webhooks.send(message);
    //         }
    //         Err(_) => {
    //             todo!("Handle unknown event type")
    //         }
    //     }
    // }
}

async fn handle_notifications(mut rx: tokio::sync::mpsc::UnboundedReceiver<Message>) {
    while let Some(message) = rx.recv().await {
        // Process notifications
        println!("Handling notification: {:?}", message);
    }
}

async fn handle_webhooks(mut rx: mpsc::UnboundedReceiver<Message>) {
    while let Some(message) = rx.recv().await {
        // Process webhooks
        println!("Handling webhook: {:?}", message);
    }
}
