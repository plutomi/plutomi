use core::panic;
use std::sync::Arc;

use async_nats::{client, Client, Event};
use futures::stream::StreamExt;
use serde_json::json;
use shared::entities::Entities;
use shared::get_current_time::get_current_time;
use shared::logger::{LogLevel, LogObject, Logger};
use time::OffsetDateTime;
use tokio::sync::mpsc;
use tokio::task;

struct Message {
    event_type: Event,
    payload: serde_json::Value,
}

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    // TODO: Acceptance criteria
    // - [ ] Can read .env parsed
    // - [ ] Can connect to MongoDB
    // - [ ] Can log messages
    // - [ ] Can consume events / consumer groups
    // - [ ] Can process/ publish  events
    // - [ ] Can generate ids with shared lib
    // Create a NATS client
    // Connect to the NATS server
    let nats_client = async_nats::connect("nats://localhost:4222").await.unwrap();

    // Create channels for each handler with their respective receivers and senders
    let (tx_notifications, rx_notifications) = mpsc::unbounded_channel();
    let (tx_webhooks, rx_webhooks) = mpsc::unbounded_channel();

    // Main event handler task
    let main_handler = tokio::spawn(async move {
        let mut subscriber = nats_client.subscribe("events.>").await.unwrap();
        while let Some(message) = subscriber.next().await {
            let event = Arc::new(message); // Wrap message in Arc for sharing

            // Send the event to the respective handler
            match event.subject {
                Event::TOTPRequested => {
                    tx_notifications.send(event).unwrap();
                }
                Event::TOTPVerified => {
                    tx_webhooks.send(event).unwrap();
                }
                _ => {
                    // Log unknown event
                    let log = LogObject {
                        level: LogLevel::Warn,
                        message: "Unknown event received".to_string(),
                        data: Some(json!({ "event": event })),
                        ..Default::default()
                    }
                }
            }
        }
    });

    // Await the tasks to complete (in practice, handle shutdowns gracefully)
    let _ = tokio::join!(handle_notifications, handle_webhooks);
}

async fn handle_notifications(mut rx: mpsc::Receiver<Arc<Message>>) {
    while let Some(message) = rx.recv().await {
        // Process notifications
        println!("Handling notification: {:?}", message);
    }
}

async fn handle_webhooks(mut rx: mpsc::Receiver<Arc<Message>>) {
    while let Some(message) = rx.recv().await {
        // Process webhooks
        println!("Handling webhook: {:?}", message);
    }
}
