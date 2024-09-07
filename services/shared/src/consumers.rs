use std::any::Any;
use std::sync::Arc;

use crate::get_current_time::get_current_time;
use crate::logger::{LogLevel, LogObject, Logger, LoggerContext};
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::{ClientConfig, Message};
use time::OffsetDateTime;

pub struct CreateConsumerOptions {
    pub name: &'static str,
    pub consumer_group: &'static str,
    pub topic: &'static str,
}

pub struct PlutomiConsumer {
    consumer: StreamConsumer,
    logger: Arc<Logger>,
    name: &'static str,
    topic: &'static str,
}

pub fn create_consumer(
    CreateConsumerOptions {
        name,
        consumer_group,
        topic,
    }: CreateConsumerOptions,
) -> PlutomiConsumer {
    let consumer: StreamConsumer = ClientConfig::new()
        .set("group.id", consumer_group)
        .set("client.id", name)
        .set("bootstrap.servers", crate::constants::BROKERS)
        .set("enable.partition.eof", "false")
        .create()
        .expect("Consumer creation failed");

    consumer
        .subscribe(&[topic])
        .expect(format!("Consumer {} failed to subscribe to topic {}", name, topic).as_str());

    let logger = Logger::init(LoggerContext { caller: name });

    PlutomiConsumer {
        consumer,
        logger,
        name,
        topic,
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
