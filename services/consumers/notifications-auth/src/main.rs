use futures::future::BoxFuture;
use serde_json::json;
use shared::{
    constants::{ConsumerGroups, Topics},
    consumers::{MessageHandlerOptions, PlutomiConsumer},
    events::{PlutomiEvent, PlutomiPayload},
    logger::LogObject,
};
use std::sync::Arc;
#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), String> {
    let notifications_consumer = PlutomiConsumer::new(
        "notifications-auth-consumer",
        ConsumerGroups::Notifications,
        Topics::Auth,
        Arc::new(send_email),
    )
    .await?;

    notifications_consumer.run().await?;

    Ok(())
}

fn send_email(
    MessageHandlerOptions {
        message,
        plutomi_consumer,
    }: MessageHandlerOptions,
) -> BoxFuture<'_, Result<(), String>> {
    Box::pin(async move {
        let plutomi_event: PlutomiEvent = plutomi_consumer.parse_message(message)?;

        plutomi_consumer.logger.info(LogObject {
            message: format!(
                "Processing {:?} event inside of {}",
                plutomi_event.event_type, &plutomi_consumer.name
            ),
            data: Some(json!(&plutomi_event.payload)),
            ..Default::default()
        });

        match plutomi_event.payload {
            PlutomiPayload::TOTPRequested { email, created_at } => {
                plutomi_consumer.logger.info(LogObject {
                    message: "Sending TOTP Code to user".to_string(),
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
