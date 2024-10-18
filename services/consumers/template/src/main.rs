use futures::future::BoxFuture;
use serde_json::json;
use shared::{
    constants::{ConsumerGroups, Topics},
    consumers::{ConsumerError, MessageHandlerOptions, PlutomiConsumer},
    entities::user::User,
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
            PlutomiEvent::UserCreated(user) => {
                plutomi_consumer.logger.info(LogObject {
                    message: format!("Processing USER.created event"),
                    data: Some(json!(user)),
                    ..Default::default()
                });

                let mut transaction = plutomi_consumer.mysql.begin().await?;

                // Update the first_name of the user to 'updated in consumer'
                let update_result = match sqlx::query!(
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
                        return Err(ConsumerError::MySQLError(message));
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
                        return Err(ConsumerError::MySQLError(message));
                    }
                };

                match transaction.commit().await {
                    Ok(_) => {
                        plutomi_consumer.logger.info(LogObject {
                            message: format!("Processed USER.created event"),
                            data: Some(json!({ "updated_user": {
                                "id": updated_user.id,
                                "first_name": updated_user.first_name,
                                "last_name": updated_user.last_name,
                                "email": updated_user.email,
                                "created_at": updated_user.created_at,
                                "updated_at": updated_user.updated_at,
                                "public_id": updated_user.public_id
                            } })),
                            ..Default::default()
                        });
                    }
                    Err(e) => {
                        let message = format!("Failed to commit transaction: {}", e);
                        plutomi_consumer.logger.error(LogObject {
                            message: message.clone(),
                            ..Default::default()
                        });
                        return Err(ConsumerError::MySQLError(message));
                    }
                };
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
