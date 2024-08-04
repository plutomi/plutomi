use async_nats::{
    jetstream::{self, new, Context},
    ConnectOptions,
};
use serde_json::json;
use std::{sync::Arc, time::Duration};

use crate::{constants::EVENT_STREAM_NAME, events::PlutomiEventPayload, get_env::get_env};

const MESSAGE_RETENTION_DAYS: u64 = 7;

/**
 * Connect to the NATS server and returns a Jetstream context.
 */
pub async fn connect_to_nats() -> Result<Context, String> {
    let env = get_env();

    let nats_config: ConnectOptions =
        ConnectOptions::new().user_and_password(env.NATS_USERNAME, env.NATS_PASSWORD);

    let client = nats_config
        .connect(&env.NATS_URL)
        .await
        .map_err(|e| format!("Failed to connect to NATS: {}", e))?;

    let jetstream = new(client);

    Ok(jetstream)
}

pub struct CreateStreamOptions<'a> {
    pub jetstream: &'a Context,
    // Typically, you want "name.>" to match all events under the name
    pub subjects: Vec<String>,
    pub stream_name: String,
}

pub async fn create_stream<'a>(
    CreateStreamOptions {
        jetstream,
        subjects,
        stream_name,
    }: CreateStreamOptions<'a>,
) -> Result<(String, Arc<jetstream::stream::Stream>), String> {
    let stream = jetstream
        .get_or_create_stream(jetstream::stream::Config {
            name: stream_name.clone(),
            subjects,
            retention: jetstream::stream::RetentionPolicy::Limits,
            max_messages: 1_000_000,
            max_bytes: 5_000_000_000, // 5GB
            max_age: Duration::from_secs(60 * 60 * 24 * MESSAGE_RETENTION_DAYS),
            discard: jetstream::stream::DiscardPolicy::Old,
            ..Default::default()
        })
        .await
        .map_err(|e| format!("Failed to create stream: {}", e))?;

    Ok((stream_name, Arc::new(stream)))
}

pub struct PublishEventOptions<'a> {
    jetstream: &'a Context,
    event: PlutomiEventPayload,
}

/**
 * Publish an event to the event stream.
 * https://natsbyexample.com/examples/messaging/json/rust
 */
pub async fn publish_event<'a>(
    PublishEventOptions { jetstream, event }: PublishEventOptions<'a>,
) -> Result<(), String> {
    let bytes = serde_json::to_vec(&json!(event))
        .map_err(|e| format!("Failed to serialize event: {}", e))?;

    jetstream
        .publish(EVENT_STREAM_NAME, bytes.into())
        .await
        .map_err(|e| format!("Failed to publish event: {}", e))?
        .await
        .map_err(|e| {
            format!(
                "Failed to get acknowledgement from NATS server event on publish: {}",
                e
            )
        })?;

    Ok(())
}
