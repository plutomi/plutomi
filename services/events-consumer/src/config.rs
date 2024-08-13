use std::time::Duration;

use shared::events::EventType;

pub struct Config {
    pub app_name: &'static str,

    pub streams: Streams,
    pub consumers: Consumers,
}

pub struct Streams {
    pub events: Stream,
    pub events_retry: Stream,
    pub events_dlq: Stream,
}

pub struct Stream {
    pub name: String,
    pub subjects: Vec<String>,
}

pub struct Consumer {
    pub name: String,
    pub filter_subjects: Vec<String>,
    pub max_delivery_attempts: i64,
    pub redeliver_after_duration: Duration,
}

pub struct Consumers {
    pub notifications: Consumer,
    pub notifications_retry: Consumer,
    pub notifications_dlq: Consumer,

    pub meta: Consumer,
    pub meta_retry: Consumer,
    pub meta_dlq: Consumer,
}

impl Config {
    pub fn new() -> Self {
        const DEFAULT_APP_NAME: &'static str = "events-consumer";

        const MAX_DELIVERIES_SUBJECT: &'static str = "$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.>";

        // Stream names
        let events_stream_name = "events".to_string();
        let events_retry_stream_name = "events-retry".to_string();
        let events_dlq_stream_name = "events-dlq".to_string();

        // Meta consumer
        let main_meta_consumer_name = "meta-consumer".to_string();
        let retry_meta_consumer_name = "meta-consumer-retry".to_string();
        let dlq_meta_consumer_name = "meta-consumer-dlq".to_string();

        // Notification consumer
        let main_notification_consumer_name = "notification-consumer".to_string();
        let retry_notification_consumer_name = "notification-consumer-retry".to_string();
        let dlq_notification_consumer_name = "notification-consumer-dlq".to_string();

        Config {
            app_name: DEFAULT_APP_NAME,

            streams: Streams {
                events: Stream {
                    name: events_stream_name.clone(),
                    // Typically, you want "name.>" so that it matches all events under the name
                    subjects: vec![format!("{}.>", events_stream_name)],
                },
                events_retry: Stream {
                    name: events_retry_stream_name.clone(),
                    subjects: vec![format!("{}.>", events_retry_stream_name)],
                },
                events_dlq: Stream {
                    name: events_dlq_stream_name.clone(),
                    subjects: vec![format!("{}.>", events_dlq_stream_name)],
                },
            },
            consumers: Consumers {
                meta: Consumer {
                    name: main_meta_consumer_name,
                    filter_subjects: vec![MAX_DELIVERIES_SUBJECT.to_string()],
                    max_delivery_attempts: 3,
                    redeliver_after_duration: Duration::from_secs(1),
                },
                // TODO: these might be unecessary if max_deliveries_subject consumer is a catch all!
                meta_retry: Consumer {
                    name: retry_meta_consumer_name,
                    filter_subjects: vec![MAX_DELIVERIES_SUBJECT.to_string()],
                    max_delivery_attempts: 3,
                    redeliver_after_duration: Duration::from_secs(1),
                },
                meta_dlq: Consumer {
                    name: dlq_meta_consumer_name,
                    filter_subjects: vec![MAX_DELIVERIES_SUBJECT.to_string()],
                    max_delivery_attempts: 3,
                    redeliver_after_duration: Duration::from_secs(1),
                },

                notifications: Consumer {
                    name: main_notification_consumer_name,
                    filter_subjects: vec![EventType::TOTPRequested.as_ref().to_string()],
                    max_delivery_attempts: 3,
                    redeliver_after_duration: Duration::from_secs(1),
                },
                notifications_retry: Consumer {
                    name: retry_notification_consumer_name.clone(),
                    filter_subjects: vec![format!(
                        "{}-{}",
                        events_retry_stream_name, retry_notification_consumer_name
                    )],
                    max_delivery_attempts: 3,
                    redeliver_after_duration: Duration::from_secs(1),
                },
                notifications_dlq: Consumer {
                    name: dlq_notification_consumer_name.clone(),
                    filter_subjects: vec![format!(
                        "{}-{}",
                        events_dlq_stream_name, dlq_notification_consumer_name
                    )],
                    max_delivery_attempts: 3,
                    redeliver_after_duration: Duration::from_secs(1),
                },
            },
            // filter_subjects: FilterSubjects {
            //     max_deliveries: vec!["$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.>".to_string()],
            //     totp_requested: EventType::TOTPRequested.as_ref().to_string(),
            // },
        }
    }
}
