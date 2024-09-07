use std::any::Any;
use std::sync::Arc;

use crate::get_current_time::get_current_time;
use crate::logger::{LogLevel, LogObject, Logger, LoggerContext};
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::{ClientConfig, Message};
use time::OffsetDateTime;

// Wrapper around StreamConsumer to add extra functionality
struct PlutomiConsumer {
    name: String,
    consumer: StreamConsumer,
    logger: Arc<Logger>,
}

impl PlutomiConsumer {
    /**
     * Creates a consumer and subscribes it to the given topic
     */
    fn new(
        name: String,
        group_id: &str,
        brokers: &str,
        topic: &'static str,
        // handler: MessageHandler,
        logger: Arc<Logger>,
    ) -> Result<Self, String> {
        let consumer: StreamConsumer = ClientConfig::new()
            .set("group.id", group_id)
            .set("client.id", name)
            .set("bootstrap.servers", brokers)
            .set("enable.partition.eof", "false")
            .set("session.timeout.ms", "6000")
            .set("enable.auto.commit", "false")
            .create()
            .map_err(|e| format!("Consumer {} creation failed: {}", name, e))?;

        consumer.subscribe(&[&topic]).map_err(|e| {
            format!(
                "Consumer {} failed to subscribe to topic {}: {}",
                name, topic, e
            )
        })?;

        Ok(PlutomiConsumer {
            name: name.to_string(),
            consumer,
            logger,
        })
    }
    async fn run(&self) -> Result<(), String> {
        self.logger.log(LogObject {
            level: LogLevel::Info,
            message: format!("{} started", &self.name),
            error: None,
            _time: get_current_time(OffsetDateTime::now_utc()),
            request: None,
            response: None,
            data: None,
        });

        loop {
            match self.consumer.recv().await {
                Ok(msg) => {
                    println!("Received message: {:?}", msg);
                    // Process message here
                    // message_handler(MessageHandlerOptions {
                    //     message: &msg,
                    //     logger: Arc::clone(&logger),
                    //     consumer_name: &consumer_name,
                    // })
                }
                Err(e) => {
                    println!("Error receiving message: {:?}", e);
                }
            }
        }
    }

    async fn handle_message(&self, message: Message) -> Result<(), String> {
        // Process the message
        Ok(())
    }
}

pub async fn consume_messages<F>(plutomi_consumer: PlutomiConsumer, process_fn: F)
where
    F: Fn(String) + Send + Sync + 'static,
{
    // Destructure plutomi_consumer
    let PlutomiConsumer {
        consumer,
        logger,
        name,
        topic,
    } = plutomi_consumer;

    loop {
        match consumer.recv().await {
            Ok(message) => {
                if let Some(payload) = message.payload() {
                    let payload_str = String::from_utf8(payload.to_vec()).unwrap();
                    process_fn(payload_str);
                }
            }
            Err(e) => logger.log(LogObject {
                level: LogLevel::Error,
                message: format!("Error while consuming messages in {}", name),
                _time: get_current_time(OffsetDateTime::now_utc()),
                data: None,
                error: None,
                request: None,
                response: None,
            }),
        }
    }
}
