use crate::constants::Topics;
use crate::get_current_time::get_current_time;
use crate::get_env::get_env;
use crate::logger::{LogLevel, LogObject, Logger, LoggerContext};
use dotenv::dotenv;
use futures::future::BoxFuture;
use rdkafka::consumer::{Consumer, StreamConsumer};
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
    Arc<dyn Fn(MessageHandlerOptions) -> BoxFuture<'_, Result<(), String>> + Send + Sync + 'static>;
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
            .set("bootstrap.servers", env.REDPANDA_BROKERS)
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

// Example usage in a producer function
use rdkafka::producer::{FutureProducer, FutureRecord};
use std::time::Duration;

async fn produce_message(
    producer: &FutureProducer,
    topic: Topics,
    key: &str,
    payload: &str,
) -> Result<(), rdkafka::error::KafkaError> {
    let topic_name = topic.as_str();

    producer
        .send(
            FutureRecord::to(topic_name).payload(payload).key(key),
            Duration::from_secs(0),
        )
        .await
        .map(|delivery| {
            println!("Message delivered to topic {}: {:?}", topic_name, delivery);
        })
        .map_err(|(err, _)| err)
}

// Function that parses a message to the given structure, and if it fails, sends it to the DLQ
fn parse_message<'a, T>(message: BorrowedMessage<'a>, logger: &Arc<Logger>) -> Result<T, String>
where
    T: serde::de::DeserializeOwned,
{
    let payload = message.payload().ok_or("No payload found in message")?;
    let payload = String::from_utf8_lossy(payload);
    serde_json::from_str::<T>(&payload).map_err(|e| {
        logger.log(LogObject {
            level: LogLevel::Error,
            message: format!("Failed to parse payload: {}", e),
            _time: get_current_time(OffsetDateTime::now_utc()),
            data: None,
            error: Some(json!(e.to_string())),
            request: None,
            response: None,
        });

        e.to_string()
    })
}
