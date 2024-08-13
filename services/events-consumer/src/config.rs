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
    pub stream: String,
    pub filter_subjects: Vec<String>,
    pub max_delivery_attempts: i64,
    pub redeliver_after_duration: Duration,
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
                name: "meta-consumer".to_string(),
                stream: "events".to_string(),
                filter_subjects: vec![
                    // This should listen to all MAX_DELIVERIES events for all business logic consumers
                    // Don't use a wildcard here because it will listen to it's own MAX_DELIVERIES event, causing a loop
                    "$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.events.notifications-consumer"
                        .to_string(),
                ],
                max_delivery_attempts: 1,
                redeliver_after_duration: Duration::from_secs(1),
            },
            ConsumerConfig {
                name: "meta-consumer-retry".to_string(),
                stream: "events-retry".to_string(),
                filter_subjects: vec![
                    // This should listen to any MAX_DELIVERIES failures for the above 'meta-consumer'
                    "$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.events-meta-consumer".to_string(),
                ],
                max_delivery_attempts: 1,
                redeliver_after_duration: Duration::from_secs(1),
            },
            ConsumerConfig {
                name: "meta-consumer-dlq".to_string(),
                stream: "events-dlq".to_string(),
                filter_subjects: vec![
                    // This should listen to any MAX_DELIVERIES failures for the above 'meta-consumer'. Something really went wrong here.
                    "$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.events-retry-consumer".to_string(),
                ],
                max_delivery_attempts: 1,
                redeliver_after_duration: Duration::from_secs(1),
            },
            /* Business logic consumers
            These handle actual functionality in the system
             */
            ConsumerConfig {
                name: "notifications-consumer".to_string(),
                stream: "events".to_string(),
                filter_subjects: vec![EventType::TOTPRequested.as_ref().to_string()],
                max_delivery_attempts: 3,
                redeliver_after_duration: Duration::from_secs(1), // 3 Seconds
            },
            ConsumerConfig {
                name: "notifications-consumer-retry".to_string(),
                stream: "events-retry".to_string(),
                filter_subjects: vec!["events-retry.notifications-consumer-retry".to_string()],
                max_delivery_attempts: 30,
                redeliver_after_duration: Duration::from_secs(10), // 5 Minutes
            },
            ConsumerConfig {
                name: "notifications-consumer-dlq".to_string(),
                stream: "events-dlq".to_string(),
                filter_subjects: vec!["events-dlq.notifications-consumer-dlq".to_string()],
                max_delivery_attempts: 300,
                redeliver_after_duration: Duration::from_secs(60), // 5 Hours
            },
        ];

        Config {
            app_name: DEFAULT_APP_NAME,
            streams,
            consumers,
        }
    }
}
