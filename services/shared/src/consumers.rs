use crate::constants::{ConsumerGroups, Topics};
use crate::events::PlutomiEvent;
use crate::get_env::get_env;
use crate::logger::{LogObject, Logger, LoggerContext};
use futures::future::BoxFuture;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::message::BorrowedMessage;
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::{ClientConfig, Message};
use serde_json::json;
use std::sync::Arc;
use std::time::Duration;
use thiserror::Error;

pub struct MessageHandlerOptions<'a> {
    pub message: &'a BorrowedMessage<'a>,
    pub plutomi_consumer: &'a PlutomiConsumer,
}
pub type MessageHandler = Arc<
    dyn Fn(MessageHandlerOptions) -> BoxFuture<'_, Result<(), ConsumerError>>
        + Send
        + Sync
        + 'static,
>;
// Wrapper around StreamConsumer to add extra functionality
pub struct PlutomiConsumer {
    pub name: &'static str,
    pub consumer: StreamConsumer,
    pub producer: FutureProducer,
    pub logger: Arc<Logger>,
    pub message_handler: MessageHandler,
}

// Custom error enum to represent different error types
#[derive(Debug, Error)]
pub enum ConsumerError {
    #[error("Parse error: {0}")]
    ParseError(String), // Represent a parse failure with an error message

    #[error("Kafka error: {0}")]
    KafkaError(String), // Represent a Kafka-specific failure with an error message

    #[error("Unknown error: {0}")]
    UnknownError(String), // Catch-all for other types of errors
}

impl PlutomiConsumer {
    /**
     * Creates a consumer and subscribes it to the given topic
     */
    pub fn new(
        name: &'static str,
        group_id: ConsumerGroups,
        topic: Topics,
        message_handler: MessageHandler,
    ) -> Result<Self, String> {
        dotenvy::dotenv().ok();

        let env = get_env();
        let logger = Logger::init(LoggerContext { application: &name });

        logger.info(LogObject {
            message: format!("Creating {}", name),
            ..Default::default()
        });

        let offset_reset = if topic.as_str().contains("-retry") || topic.as_str().contains("-dlq") {
            "earliest"
        } else {
            "latest"
        };

        let consumer: StreamConsumer = ClientConfig::new()
            .set("group.id", group_id.as_str())
            .set("client.id", name)
            .set("bootstrap.servers", &env.KAFKA_URL)
            .set("enable.partition.eof", "false")
            .set("session.timeout.ms", "6000")
            .set("enable.auto.commit", "true")
            .set("auto.offset.reset", offset_reset)
            .set("auto.commit.interval.ms", "1000")
            .create()
            .map_err(|e| {
                let err = format!("Failed to create consumer {}: {}", name, e);
                logger.error(LogObject {
                    message: err.clone(),
                    ..Default::default()
                });
                err
            })?;

        // For publishing
        let producer: FutureProducer = ClientConfig::new()
            .set("bootstrap.servers", env.KAFKA_URL)
            .set("acks", "all")
            .set("retries", "10")
            .set("message.timeout.ms", "10000")
            .set("retry.backoff.ms", "500")
            .create()
            .map_err(|e| {
                let err = format!("Failed to create producer: {}", e);
                logger.error(LogObject {
                    message: err.clone(),
                    ..Default::default()
                });
                err
            })?;

        logger.info(LogObject {
            message: format!("{} created!", name),
            ..Default::default()
        });
        consumer.subscribe(&[&topic.as_str()]).map_err(|e| {
            let err = format!(
                "Consumer {} failed to subscribe to topic {}: {}",
                name,
                topic.as_str(),
                e
            );
            logger.error(LogObject {
                message: err.clone(),
                ..Default::default()
            });

            err
        })?;

        logger.info(LogObject {
            message: format!("{} subscribed to {} topic", name, topic.as_str()),
            ..Default::default()
        });

        Ok(PlutomiConsumer {
            name,
            consumer,
            logger,
            producer,
            message_handler,
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

    // Publish a message to the specified topic
    pub async fn publish_to_topic<'a>(
        &self,
        topic: Topics,
        message: &'a BorrowedMessage<'a>,
    ) -> Result<(), String> {
        let topic_name = topic.as_str();
        let key = message.key().unwrap_or(&[]);
        let payload = message.payload().unwrap_or(&[]);
        if payload.is_empty() {
            self.logger.warn(LogObject {
                message: format!("Message payload is empty when producing a message"),
                ..Default::default()
            });
            return Err("Message payload is empty when producing a message".to_string());
        }

        let record = FutureRecord::to(topic_name).payload(payload).key(key);

        match self.producer.send(record, Duration::from_secs(0)).await {
            Ok(_) => {
                self.logger.info(LogObject {
                    message: format!("Message successfully published to topic {}", topic_name),
                    ..Default::default()
                });
                Ok(())
            }
            Err((err, _)) => {
                self.logger.error(LogObject {
                    message: format!(
                        "Failed to publish message to topic {}: {:?}",
                        topic_name, err
                    ),
                    error: Some(json!(err.to_string())),
                    ..Default::default()
                });
                Err(err.to_string())
            }
        }
    }

    pub async fn commit_message<'a>(&self, message: &'a BorrowedMessage<'a>) -> Result<(), String> {
        self.consumer
            .commit_message(message, rdkafka::consumer::CommitMode::Async)
            .map_err(|e| {
                let err = format!("Failed to commit message: {:?}", e);
                self.logger.error(LogObject {
                    message: err.clone(),
                    error: Some(json!(e.to_string())),
                    ..Default::default()
                });
                err
            })?;

        self.logger.info(LogObject {
            message: format!("Message successfully committed"),
            ..Default::default()
        });

        Ok(())
    }

    pub async fn run(&self) -> Result<(), String> {
        self.logger.info(LogObject {
            message: format!("{} running...", &self.name),
            ..Default::default()
        });

        loop {
            match self.consumer.recv().await {
                Ok(message) => {
                    let message_payload = message
                        .payload()
                        .map(|payload| String::from_utf8_lossy(payload).to_string()) // Convert bytes to a readable string
                        .unwrap_or_else(|| "No payload".to_string());

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
                            self.commit_message(&message).await?;
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
                                self.publish_to_topic(next_topic, &message).await?
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
                            self.commit_message(&message).await?;
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
    ) -> Result<PlutomiEvent, ConsumerError> {
        let payload = message.payload().unwrap_or(&[]);

        // Check if the payload is empty before attempting to deserialize
        if payload.is_empty() {
            self.logger.error(LogObject {
                message: "Message payload is empty when parsing message".to_string(),
                ..Default::default()
            });
            return Err(ConsumerError::ParseError(
                "Message payload is empty when parsing message".to_string(),
            ));
        }

        // Deserialize directly into `PlutomiEvent`, which handles both event type and payload
        serde_json::from_slice::<PlutomiEvent>(payload).map_err(|e| {
            // If parsing fails, convert the payload to a readable string for logging
            let payload_str = String::from_utf8_lossy(payload).to_string();

            self.logger.error(LogObject {
                message: format!("Failed to parse event: {}", e),
                data: Some(json!({ "message": payload_str })),
                error: Some(json!(e.to_string())),
                ..Default::default()
            });
            ConsumerError::ParseError(format!("Failed to parse event: {}", e))
        })
    }
}
