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
    )
    .await?;

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

                let mut transaction = plutomi_consumer.mysql.begin().await.unwrap_or_else(|e| {
                    let message = format!("Failed to start transaction: {}", e);
                    plutomi_consumer.logger.error(LogObject {
                        message: message.clone(),
                        ..Default::default()
                    });
                    panic!("ahh");
                });

                // Update the first_name of the user to 'updated in consumer'
                let update_result = sqlx::query!(
                    r#"
                        UPDATE users
                        SET first_name = 'updated in consumer'
                        WHERE public_id = ?
                    "#,
                    user.public_id
                )
                .execute(&mut *transaction)
                .await
                .unwrap_or_else(|e| {
                    let message = format!("Failed to update user: {}", e);
                    plutomi_consumer.logger.error(LogObject {
                        message: message.clone(),
                        ..Default::default()
                    });
                    panic!("ahh");
                });

                // Commit the transaction
                if let Err(e) = transaction.commit().await {
                    let message = format!("Failed to commit transaction: {}", e);
                    plutomi_consumer.logger.error(LogObject {
                        message: message.clone(),
                        ..Default::default()
                    });
                    panic!("ahh");
                }

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
