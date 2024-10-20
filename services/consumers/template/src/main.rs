use futures::future::BoxFuture;
use serde_json::json;
use shared::{
    constants::{ConsumerGroups, Topics},
    consumers::{MessageHandlerOptions, PlutomiConsumer},
    entities::user::{KafkaUser, User},
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
) -> BoxFuture<'_, Result<(), String>> {
    Box::pin(async move {
        let payload = plutomi_consumer.parse_message(message)?;
        match payload {
            PlutomiEvent::UserCreated(user) => {
                plutomi_consumer.logger.info(LogObject {
                    message: format!("Processing USER.created event"),
                    data: Some(json!(user)),
                    ..Default::default()
                });

                let mut transaction = plutomi_consumer.mysql.begin().await.map_err(|e| {
                    let message = format!("Failed to start transaction: {}", e);
                    plutomi_consumer.logger.error(LogObject {
                        message: message.clone(),
                        ..Default::default()
                    });
                    message
                })?;

                match sqlx::query!(
                    r#"
                        UPDATE users
                        SET first_name = 'updated in consumer'
                        WHERE id = ?
                    "#,
                    user.id
                )
                .execute(&mut *transaction)
                .await
                {
                    Ok(result) => result,
                    Err(e) => {
                        let message = format!("Failed to update user: {}", e);
                        plutomi_consumer.logger.error(LogObject {
                            message: message.clone(),
                            ..Default::default()
                        });
                        return Err(message);
                    }
                };

                let updated_user = match sqlx::query_as!(
                    User,
                    r#"
                        SELECT * 
                        FROM users
                        WHERE id = ?
                        LIMIT 1
                    "#,
                    user.id
                )
                .fetch_one(&mut *transaction)
                .await
                {
                    Ok(user) => user,
                    Err(e) => {
                        let message = format!("Failed to fetch updated user: {}", e);
                        plutomi_consumer.logger.error(LogObject {
                            message: message.clone(),
                            ..Default::default()
                        });
                        return Err(message);
                    }
                };

                match transaction.commit().await {
                    Ok(_) => {
                        plutomi_consumer.logger.info(LogObject {
                            message: format!("Processed USER.created event"),
                            data: Some(json!({ "updated_user": &updated_user })),
                            ..Default::default()
                        });

                        plutomi_consumer
                            .kafka
                            .publish(
                                Topics::Test,
                                &&updated_user.public_id.to_string(),
                                &PlutomiEvent::UserUpdated(KafkaUser {
                                    first_name: updated_user.first_name.clone(),
                                    last_name: updated_user.last_name.clone(),
                                    email: updated_user.email.clone(),
                                    public_id: updated_user.public_id.clone(),
                                    id: updated_user.id,
                                    created_at: updated_user.created_at,
                                    updated_at: updated_user.updated_at,
                                }),
                            )
                            .await?;
                    }
                    Err(e) => {
                        let message = format!("Failed to commit transaction: {}", e);
                        plutomi_consumer.logger.error(LogObject {
                            message: message.clone(),
                            ..Default::default()
                        });
                        return Err(message);
                    }
                };
            }

            PlutomiEvent::UserUpdated(user) => {
                plutomi_consumer.logger.info(LogObject {
                    message: format!("Received USER.updated event"),
                    data: Some(json!(user)),
                    ..Default::default()
                });
            }
            all_other_events => {
                let message = format!("Ignoring event {:?}", all_other_events);
                plutomi_consumer.logger.warn(LogObject {
                    message,
                    data: Some(json!({ "payload": all_other_events })),
                    ..Default::default()
                });
            }
        }

        Ok(())
    })
}
