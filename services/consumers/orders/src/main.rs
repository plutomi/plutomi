use futures::future::BoxFuture;
use rdkafka::Message;
use serde_json::json;
use shared::{
    consumers::{ConsumerError, MessageHandlerOptions, PlutomiConsumer},
    events::PlutomiEvent,
    get_current_time::get_current_time,
    logger::{LogLevel, LogObject},
};
use std::sync::Arc;
use time::OffsetDateTime;
#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), String> {
    let plutomi_consumer = PlutomiConsumer::new(
        "notifications-orders-consumer2",
        "notifications",
        "orders-retry",
        Arc::new(send_email),
    )?;

    plutomi_consumer.run().await?;

    Ok(())
}

fn send_email(
    MessageHandlerOptions {
        message,
        plutomi_consumer,
    }: MessageHandlerOptions,
) -> BoxFuture<'_, Result<(), ConsumerError>> {
    Box::pin(async move {
        let payload = plutomi_consumer.parse_message(message)?;

        match payload {
            PlutomiEvent::OrderCreated(order_payload) => {
                plutomi_consumer.logger.log(LogObject {
                    level: LogLevel::Info,
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    message: format!("Processing order created event"),
                    data: Some(json!(order_payload)),
                    error: None,
                    request: None,
                    response: None,
                });

                if order_payload.order_id.contains("crash me") && !message.topic().contains("dlq") {
                    return Err(ConsumerError::KafkaError("Crashing on purpose".to_string()));
                }
                plutomi_consumer.logger.log(LogObject {
                    level: LogLevel::Info,
                    message: format!("Processed order created event in DLQ"),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    data: Some(json!(order_payload)),
                    error: None,
                    request: None,
                    response: None,
                });
            }
            _ => {
                plutomi_consumer.logger.log(LogObject {
                    level: LogLevel::Warn,
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    message: "Invalid event type".to_string(),
                    data: None,
                    error: None,
                    request: None,
                    response: None,
                });
            }
        }

        Ok(())
    })
}
