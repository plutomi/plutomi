use rdkafka::consumer::{self, Consumer, StreamConsumer};
use rdkafka::{
    producer::{FutureProducer, FutureRecord},
    ClientConfig,
};
use serde_json::Value;
use shared::{
    constants::{ConsumerGroups, Topics},
    consumers::MessageHandler,
    events::PlutomiEvent,
    get_env::get_env,
    logger::{LogObject, Logger, LoggerContext},
};
use std::sync::Arc;
use time::Duration;

pub struct KafkaClient {
    producer: Option<Arc<FutureProducer>>,
    consumer: Option<Arc<StreamConsumer>>,
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
    ) -> Result<Arc<KafkaClient>, String> {
        let mut producer = None;
        let mut consumer = None;

        if create_producer {
            producer = Some(KafkaClient::new_producer(logger)?);
        }

        if create_consumer {
            match (consumer_group, consumer_topic) {
                (Some(group), Some(topic)) => {
                    consumer = Some(KafkaClient::new_consumer(name, logger, group, topic)?);
                }
                _ => {
                    let msg =
                        "Consumer group and topic must be provided if 'create_consumer' is true";
                    logger.error(LogObject {
                        message: msg.into(),
                        ..Default::default()
                    });
                    return Err(msg.into());
                }
            }
        }
        Ok(Arc::new(KafkaClient { producer, consumer }))
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
        
        let event_json = serde_json::to_string(payload)
            .map_err(|e| format!("Failed to serialize payload: {}", e))?;

        let produce_result = self
            .producer
            .send(
                FutureRecord::to(topic).payload(&event_json).key(key),
                std::time::Duration::from_secs(0),
            )
            .await;

        match produce_result {
            Ok(_) => Ok(()),
            Err((e, _)) => {
                let message = format!("Failed to produce message: {:?}", e);
                self.logger.error(LogObject {
                    message: message.clone(),
                    ..Default::default()
                });
                Err(message)
            }
        }
    }
}
