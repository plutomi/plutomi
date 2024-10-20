use futures::future::BoxFuture;
use serde_json::json;
use shared::{
    constants::{ConsumerGroups, Topics},
    consumers::{MessageHandlerOptions, PlutomiConsumer},
    entities::user::{KafkaUser, User},
    events::{PlutomiMessage, PlutomiPayload},
    logger::LogObject,
};
use std::sync::Arc;
use time::format_description::parse;
#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), String> {
    let notifications_consumer = PlutomiConsumer::new(
        "notifications-consumer",
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
        let parsed_message: PlutomiMessage = plutomi_consumer.parse_message(message)?;

        plutomi_consumer.logger.info(LogObject {
            message: format!("Processing  {:?} event", parsed_message.event_type),
            data: Some(json!(&parsed_message.payload)),
            ..Default::default()
        });

        match parsed_message.payload {
            PlutomiPayload::TOTPRequested(user) => {}
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
