use shared::events::EventType;
use std::time::Duration;

pub struct Config {
    pub app_name: &'static str,
    pub streams: Vec<StreamConfig>,
    pub consumers: Vec<ConsumerConfig>,
}

pub struct StreamConfig {
    pub name: String,
    pub subjects: Vec<String>,
}

pub struct ConsumerConfig {
    pub name: String,
    pub topic: String,
}

impl Config {
    pub fn new() -> Self {
        const DEFAULT_APP_NAME: &'static str = "events-consumer";

        // Create the streams
        let streams = vec![
            StreamConfig {
                name: "events".to_string(),
                subjects: vec!["events.>".to_string()],
            },
            StreamConfig {
                name: "events-retry".to_string(),
                subjects: vec!["events-retry.>".to_string()],
            },
            StreamConfig {
                name: "events-dlq".to_string(),
                subjects: vec!["events-dlq.>".to_string()],
            },
        ];

        /* Here we have two types of consumers:
        1. Meta consumers that handle system advisory messages
        2. Business logic consumers that handle the actual events/business logic

        The meta consumers are responsible for sending the business logic MAX_DELIVERIES failure to the retry/dlq streams as appropriate.
        Sometimes, the meta consumers also fail, so we have retry/dlq streams for them as well to re-attempt the routing if you will
        https://docs.nats.io/using-nats/developer/develop_jetstream/consumers#dead-letter-queues-type-functionality */
        let consumers = vec![
            ConsumerConfig {
                name: "notifications-consumer".to_string(),
                topic: "orders".to_string(),
            },
            ConsumerConfig {
                name: "notifications-retry-consumer".to_string(),
                topic: "orders-retry".to_string(),
            },
            // TODO add fallback?
            ConsumerConfig {
                name: "notifications-dlq-consumer".to_string(),
                topic: "events-dlq".to_string(),
            },
        ];

        Config {
            app_name: DEFAULT_APP_NAME,
            streams,
            consumers,
        }
    }
}
