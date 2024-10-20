use rdkafka::admin::AdminClient;
use rdkafka::client::DefaultClientContext;
use rdkafka::consumer::{Consumer, DefaultConsumerContext, StreamConsumer};
use rdkafka::message::BorrowedMessage;
use rdkafka::Message;
use rdkafka::{
    producer::{FutureProducer, FutureRecord},
    ClientConfig,
};
use serde_json::json;

use core::panic;
use std::sync::Arc;
use std::time::Duration;

use crate::constants::{ConsumerGroups, Topics};
use crate::events::PlutomiEvent;
use crate::get_env::get_env;
use crate::logger::{LogObject, Logger};

pub struct KafkaClient {
    // Will always have a producer
    pub producer: Arc<FutureProducer<DefaultClientContext>>,
    // Some services, like API, will never consume messages
    pub consumer: Option<Arc<StreamConsumer<DefaultConsumerContext>>>,

    pub admin_client: AdminClient<DefaultClientContext>,
    logger: Arc<Logger>,
}

/**
 * These are all wrapper functions so that the caller never has to care about them.
 * Simply call self.kaka.publish/commit/receive() and it will handle the rest.
 */
impl KafkaClient {
    pub fn new(
        name: &'static str,
        logger: &Arc<Logger>,

        // If create_consumer is true, you must pass in the other values
        create_consumer: bool,
        consumer_group: Option<ConsumerGroups>,
        consumer_topic: Option<Topics>,
    ) -> Arc<KafkaClient> {
        let mut consumer = None;

        let producer = KafkaClient::new_producer(&logger).unwrap_or_else(|e| {
            let msg = format!("Failed to create producer in {}: {}", &name, e);
            logger.error(LogObject {
                message: msg.clone(),
                ..Default::default()
            });
            panic!("{}", msg);
        });

        let admin_client = KafkaClient::new_admin_client(&logger).unwrap_or_else(|e| {
            let msg = format!("Failed to create admin client in {}: {}", &name, e);
            logger.error(LogObject {
                message: msg.clone(),
                ..Default::default()
            });
            panic!("{}", msg);
        });

        if create_consumer {
            match (consumer_group, consumer_topic) {
                (Some(group), Some(topic)) => {
                    consumer = Some(
                        KafkaClient::new_consumer(name, &logger, group, topic).unwrap_or_else(
                            |e| {
                                let msg = format!("Failed to create consumer in {}: {}", &name, e);
                                logger.error(LogObject {
                                    message: msg.clone(),
                                    ..Default::default()
                                });
                                panic!("{}", msg);
                            },
                        ),
                    );
                }
                _ => {
                    let msg =
                        "Consumer group and topic must be provided if 'create_consumer' is true";
                    logger.error(LogObject {
                        message: msg.into(),
                        ..Default::default()
                    });

                    panic!("{}", msg);
                }
            }
        }

        logger.info(LogObject {
            message: format!("Created Kafka client in {:?}", &name),
            ..Default::default()
        });

        Arc::new(KafkaClient {
            producer,
            consumer,
            admin_client,
            logger: Arc::clone(logger),
        })
    }
    pub fn new_producer(logger: &Arc<Logger>) -> Result<Arc<FutureProducer>, String> {
        dotenvy::dotenv().ok();

        let env = get_env();

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

        Ok(Arc::new(producer))
    }

    pub fn new_admin_client(
        logger: &Arc<Logger>,
    ) -> Result<AdminClient<DefaultClientContext>, String> {
        dotenvy::dotenv().ok();
        let env = get_env();

        let admin_client: AdminClient<DefaultClientContext> = ClientConfig::new()
            .set("bootstrap.servers", env.KAFKA_URL)
            .create()
            .map_err(|e| {
                let err = format!("Failed to create admin client: {}", e);
                logger.error(LogObject {
                    message: err.clone(),
                    ..Default::default()
                });
                err
            })?;

        Ok(admin_client)
    }

    pub fn new_consumer(
        name: &'static str,
        logger: &Arc<Logger>,

        group_id: ConsumerGroups,
        topic: Topics,
    ) -> Result<Arc<StreamConsumer>, String> {
        dotenvy::dotenv().ok();
        let env = get_env();

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

        Ok(Arc::new(consumer))
    }

    // Shorthand for sending a formatted PlutomiEvent message to a topic
    pub async fn publish(
        &self,
        topic: Topics,
        key: &str,
        payload: &PlutomiEvent,
    ) -> Result<(), String> {
        self.logger.info(LogObject {
            message: "Producing message...".to_string(),
            ..Default::default()
        });
        let event_json = serde_json::to_string(payload).map_err(|e| {
            let message = format!("Failed to serialize event: {:?}", e);
            self.logger.error(LogObject {
                message: message.clone(),
                ..Default::default()
            });
            message
        })?;

        let produce_result = self
            .producer
            .send(
                FutureRecord::to(topic.as_str())
                    .payload(&event_json)
                    .key(key),
                std::time::Duration::from_secs(0),
            )
            .await;

        if let Err(e) = produce_result {
            let message = format!("Failed to produce message: {:?}", e);
            self.logger.error(LogObject {
                message: message.clone(),
                ..Default::default()
            });
            return Err(message);
        }

        self.logger.info(LogObject {
            message: "Message produced".to_string(),
            // ! TODO: See what were doing
            data: Some(serde_json::json!({
                "topic": topic.as_str(),
                "key": key,
                "payload": payload,
            })),
            ..Default::default()
        });
        Ok(())
        // Handle produce_result here
    }

    // Publish a message to the specified topic, specifically when we don't know the type of the message
    pub async fn publish_generic<'a>(
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

    pub async fn commit<'a>(&self, message: &'a BorrowedMessage<'a>) -> Result<(), String> {
        if let Some(consumer) = &self.consumer {
            consumer
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
        } else {
            let message = "Consumer is not initialized".to_string();
            self.logger.error(LogObject {
                message: message.clone(),
                ..Default::default()
            });
            Err(message)
        }
    }

    pub async fn receive(&self) -> Result<BorrowedMessage, String> {
        if let Some(consumer) = &self.consumer {
            consumer.recv().await.map_err(|e| {
                let err = format!("Failed to receive message: {:?}", e);
                self.logger.error(LogObject {
                    message: err.clone(),
                    error: Some(json!(e.to_string())),
                    ..Default::default()
                });
                err
            })
        } else {
            let message = "Consumer is not initialized".to_string();
            self.logger.error(LogObject {
                message: message.clone(),
                ..Default::default()
            });
            Err(message)
        }
    }
}
