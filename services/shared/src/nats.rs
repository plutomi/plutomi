use async_nats::{
    connect,
    jetstream::{
        new,
        stream::{Config, Stream},
        Context,
    },
    Client,
};
use bytes::Bytes;
use serde_json::json;

use crate::{constants::EVENT_STREAM_NAME, events::PlutomiEventPayload};

struct ConnectToNatsResult {
    jetstream: Context,
    event_stream: Stream,
}
/**
 * Connect to the NATS server
 */
pub async fn connect_to_nats(nats_url: &str) -> Result<ConnectToNatsResult, String> {
    let client = connect(nats_url)
        .await
        .map_err(|e| format!("Failed to connect to NATS: {}", e))?;

    let jetstream = new(client);

    let event_stream = jetstream
        .get_or_create_stream(Config {
            name: EVENT_STREAM_NAME.to_string(),
            // Match all vents
            subjects: vec!["events.>".to_string()],
            ..Default::default()
        })
        .await
        .map_err(|e| format!("Failed to create stream: {}", e))?;

    Ok(ConnectToNatsResult {
        jetstream,
        event_stream,
    })
}

struct PublishEventOptions<'a> {
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
