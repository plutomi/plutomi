use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::{
    producer::{FutureProducer, FutureRecord},
    ClientConfig,
};

use core::panic;
use std::sync::Arc;

use crate::constants::{ConsumerGroups, Topics};
use crate::events::PlutomiEvent;
use crate::get_env::get_env;
use crate::logger::{LogObject, Logger};

pub struct KafkaClient {
    producer: Option<Arc<FutureProducer>>,
    consumer: Option<Arc<StreamConsumer>>,
    logger: Arc<Logger>,
}

impl KafkaClient {
    pub fn new(
        name: &'static str,
        logger: &Arc<Logger>,

        create_producer: bool,

        // If create_consumer is true, you must pass in the other values
        create_consumer: bool,
        consumer_group: Option<ConsumerGroups>,
        consumer_topic: Option<Topics>,
    ) -> Arc<KafkaClient> {
        let mut producer = None;
        let mut consumer = None;

        if create_producer {
            producer = Some(KafkaClient::new_producer(&logger).unwrap_or_else(|e| {
                let msg = format!("Failed to create producer in {}: {}", &name, e);
                logger.error(LogObject {
                    message: msg.clone(),
                    ..Default::default()
                });
                panic!("{}", msg);
            }))
        }

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

    // Shorthand for sending a message to a topic
    pub async fn send(
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

        if self.producer.is_none() {
            let message = "Producer is not initialized".to_string();
            self.logger.error(LogObject {
                message: message.clone(),
                ..Default::default()
            });
            return Err(message);
        }

        if let Some(producer) = &self.producer {
            let produce_result = producer
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
        } else {
            let message = "Producer is not initialized".to_string();
            self.logger.error(LogObject {
                message: message.clone(),
                ..Default::default()
            });
            return Err(message);
        }
    }
}
