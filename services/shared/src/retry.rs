use rdkafka::message::{BorrowedMessage, Headers, OwnedHeaders};
use rdkafka::producer::{FutureProducer, FutureRecord};
use serde_json::Value;
use std::time::Duration;

// Example struct to map the topics with their max retries
struct RetryConfig {
    main_retries: i32,
    retry_retries: i32,
    retry_delay_seconds: u64,
}

impl RetryConfig {
    fn for_event(event_type: &str) -> Self {
        // Customize the retry logic based on the event type
        match event_type {
            "critical_event" => RetryConfig {
                main_retries: 5, // fewer retries for critical events
                retry_retries: 2,
                retry_delay_seconds: 10, // retry after 10 seconds
            },
            _ => RetryConfig {
                main_retries: 100, // default retries for other events
                retry_retries: 5,
                retry_delay_seconds: 5, // retry after 5 seconds
            },
        }
    }
}

impl PlutomiConsumer {
    pub async fn handle_message(&self, message: BorrowedMessage<'_>) -> Result<(), String> {
        // Parse the message payload to extract the event_type
        let payload: Value = serde_json::from_slice(message.payload().unwrap_or(&[]))
            .map_err(|e| format!("Failed to parse payload: {}", e))?;

        let event_type = payload
            .get("event_type")
            .and_then(Value::as_str)
            .unwrap_or("unknown_event");

        let retry_config = RetryConfig::for_event(event_type);

        // Determine which topic the message is in
        let current_topic = message.topic();
        let retry_count = message
            .headers()
            .and_then(|headers| headers.get_as::<i32>("retry-count").ok())
            .unwrap_or(0);

        if self.is_in_dlq(current_topic) {
            println!("Message already in DLQ, no further processing.");
            return Ok(());
        }

        let max_retries = if self.is_in_retry(current_topic) {
            retry_config.retry_retries
        } else {
            retry_config.main_retries
        };

        if retry_count < max_retries {
            // Try processing the message
            if let Err(e) = self.process_message(message).await {
                println!(
                    "Message processing failed. Retrying in {} seconds...",
                    retry_config.retry_delay_seconds
                );
                // Increment retry count and send to the appropriate topic after a delay
                self.retry_message(message, retry_count + 1, retry_config.retry_delay_seconds)
                    .await?;
            }
        } else {
            // Send to DLQ after reaching max retries
            println!("Max retries reached. Sending message to DLQ.");
            self.send_to_dlq(message).await?;
        }

        Ok(())
    }

    // Check if message is in retry topic
    fn is_in_retry(&self, topic: &str) -> bool {
        topic.contains("retry")
    }

    // Check if message is in DLQ topic
    fn is_in_dlq(&self, topic: &str) -> bool {
        topic.contains("dlq")
    }

    // Retry message after a delay
    pub async fn retry_message(
        &self,
        message: BorrowedMessage<'_>,
        retry_count: i32,
        delay_seconds: u64,
    ) -> Result<(), String> {
        let topic = if self.is_in_retry(message.topic()) {
            message.topic() // Retry in the same retry topic
        } else {
            "orders-retry" // Move to retry topic if it's in the main topic
        };

        // Introduce a delay (e.g., sleep for a few seconds)
        tokio::time::sleep(Duration::from_secs(delay_seconds)).await;

        let retry_headers = OwnedHeaders::new()
            .add("retry-count", &retry_count.to_string()) // Increment retry count
            .add("last-error", "Failed to process message");

        self.producer
            .send(
                FutureRecord::to(topic)
                    .payload(message.payload())
                    .key(message.key())
                    .headers(retry_headers),
                Duration::from_secs(0),
            )
            .await
            .map_err(|e| format!("Failed to send message to retry topic: {:?}", e))?;

        Ok(())
    }

    // Send to DLQ after max retries
    pub async fn send_to_dlq(&self, message: BorrowedMessage<'_>) -> Result<(), String> {
        self.producer
            .send(
                FutureRecord::to("orders-dlq")
                    .payload(message.payload())
                    .key(message.key())
                    .headers(message.headers().unwrap_or_else(|| OwnedHeaders::new())),
                Duration::from_secs(0),
            )
            .await
            .map_err(|e| format!("Failed to send message to DLQ: {:?}", e))?;

        Ok(())
    }
}
