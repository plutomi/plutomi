use crate::get_current_time::get_current_time;
use crate::logger::{LogLevel, LogObject, Logger, LoggerContext};
use futures::future::BoxFuture;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::error::KafkaError;
use rdkafka::message::BorrowedMessage;
use rdkafka::{ClientConfig, Message};
use serde_json::json;
use std::sync::Arc;
use time::OffsetDateTime;

pub struct MessageHandlerOptions<'a> {
    pub message: BorrowedMessage<'a>,
    pub plutomi_consumer: &'a PlutomiConsumer,
}
pub type MessageHandler =
    Arc<dyn Fn(MessageHandlerOptions) -> BoxFuture<'static, Result<(), String>> + Send + Sync>;

// Wrapper around StreamConsumer to add extra functionality
pub struct PlutomiConsumer {
    pub name: &'static str,
    pub consumer: StreamConsumer,
    pub logger: Arc<Logger>,
    pub message_handler: MessageHandler,
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
        brokers: &str,
        topic: &'static str,
        message_handler: MessageHandler,
    ) -> Result<Self, String> {
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
            .set("bootstrap.servers", brokers)
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
            message_handler,
        })
    }

    pub fn get_message_type(&self, topic: &str) -> MessageType {
        if topic.contains("-retry") {
            MessageType::Retry
        } else if topic.contains("-dlq") {
            MessageType::DLQ
        } else {
            MessageType::Main
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
                    println!("Received message: {:?}", message);
                    if let Err(e) = (self.message_handler)(MessageHandlerOptions {
                        message,
                        plutomi_consumer: &self,
                    })
                    .await
                    {
                        // TODO send message
                        self.logger.log(LogObject {
                            level: LogLevel::Error,
                            message: format!(
                                "{} encountered an error handling message: {:?}",
                                &self.name, e
                            ),
                            error: Some(json!(e)),
                            _time: get_current_time(OffsetDateTime::now_utc()),
                            request: None,
                            response: None,
                            data: None,
                        });
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

    pub async fn handle_failed_message<'a>(
        &self,
        message: BorrowedMessage<'a>,
    ) -> Result<(), String> {
        let topic = message.topic();

        match self.get_message_type(topic) {
            MessageType::Main => {
                // Send to retry
            }
            MessageType::Retry => {
                // Send to DLQ
            }
            MessageType::DLQ => {
                // Just log - end of the line
            }
        }

        self.logger.log(LogObject {
            level: LogLevel::Warn,
            message: format!("{} failed to handle message", &self.name),
            error: None,
            _time: get_current_time(OffsetDateTime::now_utc()),
            request: None,
            response: None,
            data: Some(json!({ "message": message.payload() })),
        });

        Ok(())
    }
}
