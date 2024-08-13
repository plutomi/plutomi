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
        const MAX_DELIVERIES_SUBJECT: &str = "$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.>";

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

        let consumers = vec![
            ConsumerConfig {
                name: "meta-consumer".to_string(),
                stream: "events".to_string(),
                filter_subjects: vec![MAX_DELIVERIES_SUBJECT.to_string()],
                max_delivery_attempts: 3,
                redeliver_after_duration: Duration::from_secs(1),
            },
            ConsumerConfig {
                name: "meta-consumer-retry".to_string(),
                stream: "events-retry".to_string(),
                filter_subjects: vec![MAX_DELIVERIES_SUBJECT.to_string()],
                max_delivery_attempts: 3,
                redeliver_after_duration: Duration::from_secs(1),
            },
            ConsumerConfig {
                name: "meta-consumer-dlq".to_string(),
                stream: "events-dlq".to_string(),
                filter_subjects: vec![MAX_DELIVERIES_SUBJECT.to_string()],
                max_delivery_attempts: 3,
                redeliver_after_duration: Duration::from_secs(1),
            },
            ConsumerConfig {
                name: "notification-consumer".to_string(),
                stream: "events".to_string(),
                filter_subjects: vec![EventType::TOTPRequested.as_ref().to_string()],
                max_delivery_attempts: 3,
                redeliver_after_duration: Duration::from_secs(1),
            },
            ConsumerConfig {
                name: "notification-consumer-retry".to_string(),
                stream: "events-retry".to_string(),
                filter_subjects: vec!["events-retry.notification-consumer-retry".to_string()],
                max_delivery_attempts: 3,
                redeliver_after_duration: Duration::from_secs(1),
            },
            ConsumerConfig {
                name: "notification-consumer-dlq".to_string(),
                stream: "events-dlq".to_string(),
                filter_subjects: vec!["events-dlq.notification-consumer-dlq".to_string()],
                max_delivery_attempts: 3,
                redeliver_after_duration: Duration::from_secs(1),
            },
        ];

        Config {
            app_name: DEFAULT_APP_NAME,
            streams,
            consumers,
        }
    }
}
