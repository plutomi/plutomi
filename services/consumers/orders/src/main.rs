use std::sync::Arc;

use futures::future::BoxFuture;
use rdkafka::Message;
use shared::consumers::{MessageHandler, MessageHandlerOptions, PlutomiConsumer};
#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), String> {
    let plutomi_consumer = PlutomiConsumer::new(
        "notifications-orders-consumer",
        "notifications",
        "orders",
        Arc::new(send_email),
    )?;

    plutomi_consumer.run().await?;

    Ok(())
}

#[derive(Debug, serde::Deserialize)]
struct OrderPayload {
    pub order_id: String,
    pub customer_id: String,
    pub total: u64,
}
fn send_email(
    MessageHandlerOptions {
        message,
        plutomi_consumer,
    }: MessageHandlerOptions,
) -> BoxFuture<'_, Result<(), String>> {
    Box::pin(async move {
        match message.payload() {
            Some(payload) => {
                let payload = String::from_utf8_lossy(payload);
                let order_payload: OrderPayload = serde_json::from_str::<OrderPayload>(&payload)
                    .map_err(|e| format!("Failed to parse payload: {}", e))?;
                println!("Sending email for order: {:?}", order_payload);
            }
            None => {
                println!("No payload found in message");
            }
        }

        Ok(())
    })
}
