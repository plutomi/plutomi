use async_nats::{
    jetstream::{self, new, Context},
    ConnectOptions, HeaderMap,
};
use serde_json::json;
use std::{sync::Arc, time::Duration};
use time::OffsetDateTime;

use crate::{
    events::PlutomiEvent,
    get_current_time::get_current_time,
    get_env::get_env,
    logger::{LogObject, Logger},
};

const MESSAGE_RETENTION_DAYS: u64 = 7;

pub struct ConnectToNatsOptions {
    pub logger: Arc<Logger>,
}
/**
 * Connect to the NATS server and returns a Jetstream context.
 */
pub async fn connect_to_nats(
    ConnectToNatsOptions { logger }: ConnectToNatsOptions,
) -> Result<Context, String> {
    let env = get_env();

    let nats_config: ConnectOptions = ConnectOptions::new()
        .user_and_password(env.NATS_USERNAME, env.NATS_PASSWORD)
        .no_echo();

    let client = nats_config.connect(&env.NATS_URL).await.map_err(|e| {
        let msg = String::from("Failed to connect to NATS");
        logger.log(LogObject {
            level: crate::logger::LogLevel::Error,
            message: msg.clone(),
            _time: get_current_time(OffsetDateTime::now_utc()),
            data: None,
            error: Some(json!({ "error": e.to_string() })),
            request: None,
            response: None,
        });
        // Return it to upstream callers
        msg
    })?;

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
    let mut all_subjects = subjects;

    // All streams should listen to this event so that the meta_handler can send it to the retry/dlq stream
    let max_deliver_attempts_event = format!(
        "$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.{}.>",
        stream_name
    );
    all_subjects.push(max_deliver_attempts_event);

    let stream = jetstream
        .get_or_create_stream(jetstream::stream::Config {
            name: stream_name.clone(),
            subjects: all_subjects,
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
    pub jetstream_context: &'a Context,
    pub stream_name: String,
    pub plutomi_event: PlutomiEvent,
    // For retry and DLQ streams
    pub headers: Option<HeaderMap>,
}

/**
 * Publish an event to the event stream.
 * https://natsbyexample.com/examples/messaging/json/rust
 */
pub async fn publish_event<'a>(
    PublishEventOptions {
        jetstream_context,
        plutomi_event,
        stream_name,
        headers,
    }: PublishEventOptions<'a>,
) -> Result<(), String> {
    let bytes = serde_json::to_vec(&json!(plutomi_event))
        .map_err(|e| format!("Failed to serialize event: {}", e))?;

    let publish_result = match headers {
        Some(headers) => {
            jetstream_context
                .publish_with_headers(stream_name, headers, bytes.into())
                .await
        }
        None => jetstream_context.publish(stream_name, bytes.into()).await,
    };

    publish_result
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
