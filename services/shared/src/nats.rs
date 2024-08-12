use async_nats::{
    jetstream::{self, Context},
    ConnectOptions, HeaderMap,
};
use serde::Serialize;
use serde_json::json;
use std::{sync::Arc, time::Duration};
use time::OffsetDateTime;

use crate::{
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
) -> Result<Arc<Context>, String> {
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

    let jetstream = Arc::new(jetstream::new(client));

    Ok(jetstream)
}

pub struct CreateStreamOptions<'a> {
    pub jetstream_context: &'a Context,
    // Typically, you want "name.>" to match all events under the name
    pub subjects: Vec<String>,
    pub stream_name: String,
}

pub async fn create_stream<'a>(
    CreateStreamOptions {
        jetstream_context,
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

    let stream = jetstream_context
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

pub struct PublishEventOptions<'a, T: Serialize> {
    pub jetstream_context: &'a Context,
    pub stream_name: String,
    // This is optional because on retry & DLQ streams, we don't want to re-publish the event
    // It'll stay in the original 'events' stream and metadata will be sent to the handlers to handle it
    pub event: Option<T>,
    // For retry and DLQ streams
    pub headers: Option<HeaderMap>,
}

/**
 * Publish an event to a primary stream like 'events'.
 * If you want to publish to retry or DLQ streams, use the headers function to publish headers only,
 * and have the handler lookup the original event in the 'events' stream.
 * https://natsbyexample.com/examples/messaging/json/rust
 */
pub async fn publish_event<'a, T: Serialize>(
    PublishEventOptions {
        jetstream_context,
        event,
        stream_name,
        headers,
    }: PublishEventOptions<'a, T>,
) -> Result<(), String> {
    let bytes = serde_json::to_vec(&json!(event))
        .map_err(|e| format!("Failed to serialize event: {}", e))?;

    // Set the headers to an empty map if it's None
    let headers = headers.unwrap_or_else(HeaderMap::new);

    let publish_result = jetstream_context
        .publish_with_headers(stream_name, headers, bytes.into())
        .await;

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
