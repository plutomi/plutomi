use crate::constants::{ConsumerGroups, Topics};
use crate::events::PlutomiEvent;
use crate::kafka::KafkaClient;
use crate::logger::{LogObject, Logger, LoggerContext};
use crate::mysql::MySQLClient;
use futures::future::BoxFuture;
use rdkafka::message::BorrowedMessage;
use rdkafka::Message;
use serde_json::json;
use sqlx::MySqlPool;
use std::sync::Arc;

pub struct MessageHandlerOptions<'a> {
    pub message: &'a BorrowedMessage<'a>,
    pub plutomi_consumer: &'a PlutomiConsumer,
}
pub type MessageHandler =
    Arc<dyn Fn(MessageHandlerOptions) -> BoxFuture<'_, Result<(), String>> + Send + Sync + 'static>;
// Wrapper around StreamConsumer to add extra functionality
pub struct PlutomiConsumer {
    pub name: &'static str,
    pub kafka: Arc<KafkaClient>,
    pub mysql: Arc<MySqlPool>,
    pub logger: Arc<Logger>,
    pub message_handler: MessageHandler,
}

impl PlutomiConsumer {
    /**
     * Creates a consumer and subscribes it to the given topic
     */
    pub async fn new(
        name: &'static str,
        group_id: ConsumerGroups,
        topic: Topics,
        message_handler: MessageHandler,
    ) -> Result<Self, String> {
        dotenvy::dotenv().ok();

        let logger = Logger::init(LoggerContext { application: &name })?;

        let kafka = KafkaClient::new(
            name,
            &Arc::clone(&logger),
            true,
            Some(group_id),
            Some(topic),
        );

        let mysql = MySQLClient::new(name, &Arc::clone(&logger), None).await?;

        Ok(PlutomiConsumer {
            name,
            logger,
            message_handler,
            kafka,
            mysql,
        })
    }

    pub fn get_next_topic(&self, topic: Topics) -> Option<Topics> {
        match topic {
            Topics::Test => Some(Topics::TestRetry),
            Topics::TestRetry => Some(Topics::TestDLQ),
            // Don't retry DLQ messages
            Topics::TestDLQ => None,
        }
    }

    pub async fn run(&self) -> Result<(), String> {
        self.logger.info(LogObject {
            message: format!("{} running...", &self.name),
            ..Default::default()
        });

        loop {
            match self.kafka.receive().await {
                Ok(message) => {
                    let message_payload = message
                        .payload()
                        // Convert bytes to a readable string
                        .map(|payload| String::from_utf8_lossy(payload).to_string())
                        .unwrap_or_else(|| {
                            let msg = format!("Failed to convert message payload to string");
                            self.logger.error(LogObject {
                                message: msg.clone(),
                                data: Some(json!({ "payload": message.payload() })),
                                ..Default::default()
                            });
                            msg
                        });

                    self.logger.info(LogObject {
                        message: format!("{} received message", &self.name),
                        data: Some(json!({ "message": message_payload })),
                        ..Default::default()
                    });

                    // Handle the message results
                    match (self.message_handler)(MessageHandlerOptions {
                        message: &message,
                        plutomi_consumer: &self,
                    })
                    .await
                    {
                        Ok(_) => {
                            self.logger.info(LogObject {
                                message: format!("{} successfully handled message", &self.name),
                                data: Some(json!({ "message": message_payload })),
                                ..Default::default()
                            });
                            self.kafka.commit(&message).await?;
                        }
                        Err(error) => {
                            let (error_message, next_topic) = (
                                format!(
                                    "{:?}: {:?}",
                                    error,
                                    message.payload().map(|p| String::from_utf8_lossy(p))
                                ),
                                // Get the next topic based on the current one
                                self.get_next_topic(message.topic().into()),
                            );

                            // Log the error message
                            self.logger.error(LogObject {
                                message: format!(
                            "{} encountered an error handling message: {}, publishing into {:?}",
                            &self.name, error_message, next_topic
                        ),
                                data: Some(json!({ "message": message_payload })),
                                error: Some(json!(error_message)),
                                ..Default::default()
                            });

                            // Publish to the next topic (retry or DLQ)
                            if let Some(next_topic) = next_topic {
                                self.kafka.publish_generic(next_topic, &message).await?
                            } else {
                                // If no next topic is found, log a warning (message already in DLQ)
                                self.logger.warn(LogObject {
                                    message: format!(
                                        "{} TODO add message will no longer be retried",
                                        &self.name
                                    ),
                                    data: Some(json!({ "message": message_payload })),
                                    ..Default::default()
                                })
                            }

                            // Commit the message to avoid reprocessing
                            self.kafka.commit(&message).await?;
                        }
                    }
                }
                Err(e) => {
                    let error_string = format!("{:?}", e);
                    self.logger.error(LogObject {
                        message: format!(
                            "{} encountered an error awaiting messages from Kafka",
                            &self.name
                        ),
                        error: Some(json!(error_string)),
                        ..Default::default()
                    });
                }
            }
        }
    }

    pub fn parse_message<'a>(
        &self,
        message: &'a BorrowedMessage<'a>,
    ) -> Result<PlutomiEvent, String> {
        let payload = message.payload().unwrap_or(&[]);

        // Check if the payload is empty before attempting to deserialize
        if payload.is_empty() {
            self.logger.error(LogObject {
                message: "Message payload is empty when parsing message".to_string(),
                ..Default::default()
            });
            return Err("Message payload is empty when parsing message".to_string());
        }

        // Deserialize directly into `PlutomiEvent`, which handles both event type and payload
        serde_json::from_slice::<PlutomiEvent>(payload).map_err(|e| {
            // If parsing fails, convert the payload to a readable string for logging
            let payload_str = String::from_utf8_lossy(payload).to_string();
            let msg = format!("Failed to parse event: {}", e);
            self.logger.error(LogObject {
                message: msg.clone(),
                data: Some(json!({ "message": payload_str })),
                error: Some(json!(e.to_string())),
                ..Default::default()
            });

            msg
        })
    }
}
