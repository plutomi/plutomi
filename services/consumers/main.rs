use async_nats::jetstream::Message;
use dotenv::dotenv;
use futures::future::BoxFuture;
use rdkafka::admin::{AdminClient, AdminOptions, NewTopic, TopicReplication};
use rdkafka::client::DefaultClientContext;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::types::RDKafkaErrorCode;
use rdkafka::ClientConfig;
use serde_json::json;
use shared::events::PlutomiEvent;
use shared::get_current_time::get_current_time;
use shared::logger::{LogLevel, LogObject, Logger, LoggerContext};

use std::sync::Arc;
use std::time::Duration;
use time::OffsetDateTime;
use tokio::task::JoinHandle;

mod config;

const RESTART_ON_ERROR_DURATION: Duration = Duration::from_secs(2);

struct MessageHandlerOptions<'a> {
    message: &'a Message,
    logger: Arc<Logger>,
    consumer_name: &'a str,
}

fn test_handler() -> BoxFuture<'static, Result<(), String>> {
    Box::pin(async {
        println!("Hello from test handler");
        Ok(())
    })
}

type MessageHandler =
    Arc<dyn Fn(MessageHandlerOptions) -> BoxFuture<'_, Result<(), String>> + Send + Sync>;

#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), String> {
    dotenv().ok();

    let config = config::Config::new();

    let logger = Logger::init(LoggerContext {
        caller: &config.app_name,
    });




    let all_consumers: Vec<PlutomiConsumer> =
        vec![order_notification_consumers, user_notification_consumers]
            .into_iter()
            .flatten()
            .collect();

    //  Create all consumers
    let consumer_handles: Vec<_> = all_consumers
        .iter()
        .map(|consumer| async move {
            consumer
                .spawn()
                .await
                .map_err(|e| format!("Failed to spawn consumer: {}", e))
        })
        .collect();

    // // Run indefinitely
    // let _ = futures::future::join_all(consumer_handles).await;

    // tokio::signal::ctrl_c()
    //     .await
    //     .expect("Failed to wait for ctrl_c signal");

    // tokio::signal::ctrl_c()
    //     .await
    //     .expect("Failed to wait for ctrl_c signal");

    Ok(())
}







fn send_email(
    MessageHandlerOptions {
        message,
        logger,
        consumer_name,
    }: MessageHandlerOptions,
) -> BoxFuture<'_, Result<(), String>> {
    Box::pin(async move {
        // let event: PlutomiEvent =
        //     extract_message(&message, Arc::clone(&logger), jetstream_context).await?;

        let event = PlutomiEvent::from_jetstream(&message.subject, &message.payload)?;

        logger.log(LogObject {
            level: LogLevel::Info,
            message: format!(
                "Processing 1 {:?} message in {}",
                &event.event_type(), // TODO this should use the actual event subject / type instead of this i think for easier filtering
                &consumer_name
            ),
            _time: get_current_time(OffsetDateTime::now_utc()),
            error: None,
            request: None,
            response: None,
            // TODO payload is in bytes, should be converted to string
            data: Some(json!({ "subject": &event.event_type(), "payload": &message.payload })),
        });

        match event {
            PlutomiEvent::TOTPRequested(payload) => {
                let x = payload.email;

                if x.contains("crash") && !consumer_name.contains("dlq") {
                    // TODO is bug here, in retry consumer, does not send to DLQ
                    return Err("Email contains crash".to_string());
                } else {
                    logger.log(LogObject {
                        level: LogLevel::Info,
                        message: format!("Email sent to {} in DLQ", x),
                        _time: get_current_time(OffsetDateTime::now_utc()),
                        error: None,
                        request: None,
                        response: None,
                        data: None,
                    });
                }
                // Send the email
                // let payload = match message.payload {
                //     PlutomiEventPayload::TOTPRequested(payload) => payload,
                //     _ => {
                //         logger.log(LogObject {
                //             level: LogLevel::Error,
                //             message: "Invalid payload for TOTPRequested".to_string(),
                //             _time: get_current_time(OffsetDateTime::now_utc()),
                //             error: None,
                //             request: None,
                //             response: None,
                //             data: Some(json!({ "payload": message.payload })),
                //         });
                //         return Err("Invalid payload for TOTPRequested".to_string());
                //     }
                // };

                // Send the email
                // send_email(payload.email).await?;
            }
            _ => {
                logger.log(LogObject {
                    level: LogLevel::Warn,
                    message: format!(
                        "Unknown event type {:?} in {:?}",
                        message.subject, consumer_name
                    ),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    error: None,
                    request: None,
                    response: None,
                    data: Some(json!({ "payload": message.payload })),
                });
            }
        }

        Ok(())
    })
}
