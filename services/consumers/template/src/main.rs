use futures::future::BoxFuture;
use rdkafka::Message;
use serde_json::json;
use shared::{
    constants::{ConsumerGroups, Topics},
    consumers::{ConsumerError, MessageHandlerOptions, PlutomiConsumer},
    events::PlutomiEvent,
    logger::LogObject,
};
use std::sync::Arc;
#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), String> {
    let plutomi_consumer = PlutomiConsumer::new(
        "template-consumer",
        ConsumerGroups::TemplateDoNotUse,
        Topics::Test,
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
            PlutomiEvent::TemplateDoNotUse(template_payload) => {
                plutomi_consumer.logger.info(LogObject {
                    message: format!("Processing TEMPLATE.created event"),
                    data: Some(json!(template_payload)),
                    ..Default::default()
                });

                if template_payload.email.contains("crash me") && !message.topic().contains("dlq") {
                    return Err(ConsumerError::KafkaError("Crashing on purpose".to_string()));
                }
                plutomi_consumer.logger.info(LogObject {
                    message: format!("Processed TEMPLATE.created event"),
                    data: Some(json!(template_payload)),
                    ..Default::default()
                });
            }
            PlutomiEvent::UserCreated(user) => {
                plutomi_consumer.logger.info(LogObject {
                    message: format!("Processing USER.created event"),
                    data: Some(json!(user)),
                    ..Default::default()
                });

                plutomi_consumer.logger.info(LogObject {
                    message: format!("Processed USER.created event"),
                    data: Some(json!(user)),
                    ..Default::default()
                });
            }
            _ => {
                plutomi_consumer.logger.warn(LogObject {
                    message: "Invalid event type".to_string(),
                    ..Default::default()
                });
            }
        }

        Ok(())
    })
}
