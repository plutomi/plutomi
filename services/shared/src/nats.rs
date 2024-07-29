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

/**
 * Connect to the NATS server and returns a Jetstream context.
 */
pub async fn connect_to_nats(nats_url: &str) -> Result<Context, String> {
    let client = connect(nats_url)
        .await
        .map_err(|e| format!("Failed to connect to NATS: {}", e))?;

    let jetstream = new(client);

    // let event_stream = create_stream(CreateStream {
    //     jetstream: &jetstream,
    //     subjects: vec!["events.>".to_string()],
    // })
    // .await?;

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
) -> Result<Stream, String> {
    // The default should be the event stream name
    // if you want to create another stream, for example "jobs.>", you can pass it in the subjects
    let subjects = match subjects {
        Some(subjects) => subjects,
        None => vec![EVENT_STREAM_NAME.to_string()],
    };

    jetstream
        .get_or_create_stream(Config {
            name: EVENT_STREAM_NAME.to_string(),
            subjects,
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
