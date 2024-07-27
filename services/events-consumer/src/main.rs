use core::panic;
use std::fmt::format;
use std::os::unix::process;
use std::str::FromStr;
use std::sync::Arc;

use async_nats::jetstream::consumer::{Consumer, PullConsumer};
use async_nats::jetstream::stream::Stream;
use async_nats::jetstream::{self, Message};
use async_nats::{client, Client};
use futures::stream::StreamExt;
use serde_json::json;

use shared::constants::EVENT_STREAM_NAME;
use shared::entities::Entities;
use shared::events::PlutomiEvents;
use shared::get_current_time::get_current_time;
use shared::logger::{LogLevel, LogObject, Logger};
use time::OffsetDateTime;
use tokio::sync::mpsc;
use tokio::task::{self, JoinHandle};
use tracing::{info, warn};

mod setup_consumer;
use setup_consumer::{setup_consumer, SetupConsumerOptions};

const EMAIL_CONSUMER_NAME: &str = "email-consumer";

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    let EMAIL_CONSUMER_SUBJECTS = vec![PlutomiEvents::TOTPRequested]
        .into_iter()
        .map(|event| event.as_string())
        .collect();

    // Setup logging
    let logger = Logger::new();
    info!("Logger initialized in events-consumer"); // TODO

    // TODO: Acceptance criteria
    // - [ ] Can read .env parsed
    // - [ ] Can connect to MongoDB
    // - [ ] Can log messages
    // - [ ] Can consume events / consumer groups
    // - [ ] Can process/ publish  events
    // - [ ] Can generate ids with shared lib
    // Create a NATS client
    // Connect to the NATS server
    // TODO: Add nats url to secrets
    let nats_client = async_nats::connect("nats://localhost:4222")
        .await
        // TODO: Better logging
        .unwrap_or_else(|e| panic!("Failed to connect to NATS: {}", e));
    let jetstream = async_nats::jetstream::new(nats_client);

    let stream = jetstream
        .get_or_create_stream(jetstream::stream::Config {
            name: EVENT_STREAM_NAME.to_string(),
            // Match all vents
            subjects: vec!["events.>".to_string()],
            ..Default::default()
        })
        .await
        // TODO better logging
        .unwrap_or_else(|e| panic!("Failed to create stream: {}", e));

    // let email_consumer = setup_consumer(SetupConsumerOptions {
    //     stream,
    //     name: EMAIL_CONSUMER_NAME,
    //     subjects: EMAIL_CONSUMER_SUBJECTS,
    // })
    // .await
    // .unwrap_or_else(|e| {
    //     panic!("{}", e); // TODO better logging
    // });

    // let email_handler: JoinHandle<Result<_, _>> =
    //     tokio::spawn(async move { run_consumer(email_consumer).await });

    // // Wait for all consumers to complete (they run indefinitely in this example)
    // tokio::try_join!(email_handler)?;

    // Ok(())

    let email_consumer = setup_consumer(SetupConsumerOptions {
        stream: &stream,
        name: EMAIL_CONSUMER_NAME,
        subjects: EMAIL_CONSUMER_SUBJECTS,
    })
    .await
    .unwrap_or_else(|e| panic!("{}", e));
}

async fn run_consumer(consumer: Consumer, message_handler: Result<_, _>) -> Result<_, _> {
    loop {
        let mut messages = consumer.fetch().messages().await?;
        while let Some(msg) = messages.next().await {
            let message = msg?;
            // Process email-related event
            println!("Email consumer processing: {}", message.subject);
            // Implement email sending logic here

            message_handler(message).await?;
            message.ack().await?;
        }
    }
}
