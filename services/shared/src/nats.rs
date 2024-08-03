use std::time::Duration;

use async_nats::{
    connect,
    jetstream::{self, new, Context},
    ConnectOptions,
};
use serde_json::json;

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
    pub subjects: Option<Vec<String>>,
}
pub async fn create_stream<'a>(
    CreateStreamOptions {
        jetstream,
        subjects,
    }: CreateStreamOptions<'a>,
) -> Result<jetstream::stream::Stream, String> {
    // The default should be the event stream name
    // if you want to create another stream, for example "jobs.>", you can pass it in the subjects
    let subjects = match subjects {
        Some(subjects) => subjects,
        // Catch all for events.anything.after.multiple.subjects
        // https://docs.nats.io/nats-concepts/subjects#matching-multiple-tokens
        None => vec![format!("{}.>", EVENT_STREAM_NAME).to_string()],
    };

    jetstream
        .get_or_create_stream(jetstream::stream::Config {
            name: EVENT_STREAM_NAME.to_string(),
            subjects,
            retention: jetstream::stream::RetentionPolicy::Limits,
            max_messages: 1_000_000,
            max_bytes: 5_000_000_000, // 5GB
            max_age: Duration::from_secs(60 * 60 * 24 * MESSAGE_RETENTION_DAYS),
            discard: jetstream::stream::DiscardPolicy::Old,
            ..Default::default()
        })
        .await
        .map_err(|e| format!("Failed to create stream: {}", e))
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
