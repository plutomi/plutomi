use crate::constants::Topics;
use crate::get_current_time::get_current_time;
use crate::get_env::get_env;
use crate::logger::{LogLevel, LogObject, Logger, LoggerContext};
use dotenv::dotenv;
use futures::future::BoxFuture;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::message::BorrowedMessage;
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::{ClientConfig, Message};
use serde_json::json;
use std::sync::Arc;
use std::time::Duration;
use thiserror::Error;
use time::OffsetDateTime;

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

enum MessageType {
    Retry,
    DLQ,
    Main,
}

impl PlutomiConsumer {
    /**
     * Creates a consumer and subscribes it to the given topic
     */
    pub fn new(
        name: &'static str,
        group_id: &str,
        topic: &'static str,
        message_handler: MessageHandler,
    ) -> Result<Self, String> {
        dotenv().ok();

        let env = get_env();
        let logger = Logger::init(LoggerContext { caller: &name });

        logger.log(LogObject {
            level: LogLevel::Info,
            message: format!("Creating {}", name),
            _time: get_current_time(OffsetDateTime::now_utc()),
            request: None,
            response: None,
            data: None,
            error: None,
        });

        let consumer: StreamConsumer = ClientConfig::new()
            .set("group.id", group_id)
            .set("client.id", name)
            .set("bootstrap.servers", &env.REDPANDA_BROKERS)
            .set("enable.partition.eof", "false")
            .set("session.timeout.ms", "6000")
            .set("enable.auto.commit", "false")
            .create()
            .map_err(|e| {
                let err = format!("Failed to create consumer {}: {}", name, e);
                logger.log(LogObject {
                    level: LogLevel::Error,
                    message: err.clone(),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    request: None,
                    response: None,
                    data: None,
                    error: None,
                });
                err
            })?;

        // For publishing
        let producer: FutureProducer = ClientConfig::new()
            .set("bootstrap.servers", env.REDPANDA_BROKERS)
            .set("acks", "all")
            .set("retries", "10")
            .set("message.timeout.ms", "10000")
            .set("retry.backoff.ms", "500")
            .create()
            .map_err(|e| {
                let err = format!("Failed to create producer: {}", e);
                logger.log(LogObject {
                    level: LogLevel::Error,
                    message: err.clone(),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    request: None,
                    response: None,
                    data: None,
                    error: None,
                });
                err
            })?;

        logger.log(LogObject {
            level: LogLevel::Info,
            message: format!("{} created!", name),
            _time: get_current_time(OffsetDateTime::now_utc()),
            request: None,
            response: None,
            data: None,
            error: None,
        });
        consumer.subscribe(&[&topic]).map_err(|e| {
            let err = format!(
                "Consumer {} failed to subscribe to topic {}: {}",
                name, topic, e
            );
            logger.log(LogObject {
                level: LogLevel::Error,
                message: err.clone(),
                _time: get_current_time(OffsetDateTime::now_utc()),
                request: None,
                response: None,
                data: None,
                error: None,
            });

            err
        })?;

        logger.log(LogObject {
            level: LogLevel::Info,
            message: format!("{} subscribed to {} topic", name, topic),
            _time: get_current_time(OffsetDateTime::now_utc()),
            request: None,
            response: None,
            data: None,
            error: None,
        });

        Ok(PlutomiConsumer {
            name,
            consumer,
            logger,
            producer,
            message_handler,
        })
    }

    pub fn get_current_topic(&self, topic: &str) -> MessageType {
        if topic.contains("-retry") {
            MessageType::Retry
        } else if topic.contains("-dlq") {
            MessageType::DLQ
        } else {
            MessageType::Main
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

        let record = FutureRecord::to(topic_name).payload(payload).key(key);

        match self.producer.send(record, Duration::from_secs(0)).await {
            Ok(_) => {
                self.logger.log(LogObject {
                    level: LogLevel::Info,
                    message: format!("Message successfully published to topic {}", topic_name),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    request: None,
                    response: None,
                    data: None,
                    error: None,
                });
                Ok(())
            }
            Err((err, _)) => {
                self.logger.log(LogObject {
                    level: LogLevel::Error,
                    message: format!(
                        "Failed to publish message to topic {}: {:?}",
                        topic_name, err
                    ),
                    _time: get_current_time(OffsetDateTime::now_utc()),
                    request: None,
                    response: None,
                    data: None,
                    error: Some(json!(err.to_string())),
                });
                Err(err.to_string())
            }
        }
    }
    pub async fn run(&self) -> Result<(), String> {
        self.logger.log(LogObject {
            level: LogLevel::Info,
            message: format!("{} running...", &self.name),
            error: None,
            _time: get_current_time(OffsetDateTime::now_utc()),
            request: None,
            response: None,
            data: None,
        });

        loop {
            match self.consumer.recv().await {
                Ok(message) => {
                    self.logger.log(LogObject {
                        level: LogLevel::Info,
                        message: format!("{} received message", &self.name),
                        error: None,
                        _time: get_current_time(OffsetDateTime::now_utc()),
                        request: None,
                        response: None,
                        data: Some(json!({ "message": message.payload() })),
                    });

                    let handler_result = (self.message_handler)(MessageHandlerOptions {
                        message: &message,
                        plutomi_consumer: &self,
                    })
                    .await;

                    match handler_result {
                        // We successfully processed the message
                        // Commit the message to the Kafka broker
                        Ok(_) => {
                            self.consumer
                                .commit_message(&message, rdkafka::consumer::CommitMode::Async)
                                .unwrap_or_else(|e| {
                                    self.logger.log(LogObject {
                                        level: LogLevel::Error,
                                        message: format!("Failed to commit message: {:?}", e),
                                        _time: get_current_time(OffsetDateTime::now_utc()),
                                        request: None,
                                        response: None,
                                        data: None,
                                        error: Some(json!(e.to_string())),
                                    });
                                });
                        }
                        Err(e) => {
                            match e {
                                ConsumerError::ParseError(err_msg) => {
                                    // Send the message to the DLQ if it's a parse error
                                    // We don't want to keep retrying this, we probably misconfigured something
                                    self.logger.log(LogObject {
                                        level: LogLevel::Error,
                                        message: format!(
                                            "{} encountered a parse error handling message: {:?}",
                                            &self.name, err_msg
                                        ),
                                        error: Some(json!(err_msg)),
                                        _time: get_current_time(OffsetDateTime::now_utc()),
                                        request: None,
                                        response: None,
                                        data: None,
                                    });

                                    self.publish_to_topic(Topics::OrdersDLQ, &message).await?;
                                }
                                // Handle Kafka-specific errors (retry or DLQ logic)
                                ConsumerError::KafkaError(err_msg) => {
                                    self.logger.log(LogObject {
                                        level: LogLevel::Error,
                                        message: format!(
                                            "{} encountered a Kafka error handling message: {:?}",
                                            &self.name, err_msg
                                        ),
                                        error: Some(json!(err_msg)),
                                        _time: get_current_time(OffsetDateTime::now_utc()),
                                        request: None,
                                        response: None,
                                        data: None,
                                    });
                                    self.publish_to_topic(Topics::OrdersRetry, &message).await?;
                                }
                                ConsumerError::UnknownError(err_msg) => {
                                    // Do nothing, publish to DLQ though
                                    self.logger.log(LogObject {
                                        level: LogLevel::Error,
                                        message: format!(
                                            "{} encountered an unknown error handling message: {:?}",
                                            &self.name, err_msg
                                        ),
                                        error: Some(json!(err_msg)),
                                        _time: get_current_time(OffsetDateTime::now_utc()),
                                        request: None,
                                        response: None,
                                        data: None,
                                    });
                                }
                            }
                        }
                    }
                }
                Err(e) => {
                    let error_string = format!("{:?}", e);
                    self.logger.log(LogObject {
                        level: LogLevel::Error,
                        message: format!(
                            "{} encountered an error awaiting messages from Kafka",
                            &self.name
                        ),
                        error: Some(json!(error_string)),
                        _time: get_current_time(OffsetDateTime::now_utc()),
                        request: None,
                        response: None,
                        data: None,
                    });
                }
            }
        }
    }

    pub fn parse_message<'a, T>(
        message: BorrowedMessage<'a>,
        logger: &Arc<Logger>,
    ) -> Result<T, ConsumerError>
    where
        T: serde::de::DeserializeOwned,
    {
        let payload = message.payload().ok_or_else(|| {
            let msg = "No payload found in message".to_string();
            logger.log(LogObject {
                level: LogLevel::Error,
                message: msg.clone(),
                _time: get_current_time(OffsetDateTime::now_utc()),
                data: None,
                error: None,
                request: None,
                response: None,
            });
            ConsumerError::ParseError(msg)
        })?;

        serde_json::from_slice::<T>(payload).map_err(|e| {
            let msg = format!("Failed to parse payload: {}", e);
            logger.log(LogObject {
                level: LogLevel::Error,
                message: msg.clone(),
                _time: get_current_time(OffsetDateTime::now_utc()),
                data: None,
                error: Some(json!(e.to_string())),
                request: None,
                response: None,
            });

            ConsumerError::ParseError(msg)
        })
    }
}
