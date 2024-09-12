use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};
use time::OffsetDateTime;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "snake_case")]
pub struct MaxDeliverAdvisory {
    #[serde(rename = "type")]
    pub event_type: String,
    // Unique correlation ID for this event
    pub id: String,
    #[serde(with = "time::serde::rfc3339")]
    pub timestamp: OffsetDateTime, // The time this event was created in RFC3339 format
    pub stream: String, // The name of the consumer where the message reached its limit
    pub consumer: String,
    pub stream_seq: u64,
    // How many times the message was delivered
    pub deliveries: u64,
    /* If we have a notifications-consumer which reaches it's MAX_DELIVERIES, NATS sends a MAX_DELIVERIES advisory to the meta-consumer.
    However, the meta-consumer can also reach it's MAX_DELIVERIES, so we need to know the original message that failed for when it gets to the meta-consumer-retry, and same for the DLQ.
    That is why we have this field, so in each handler when calling extract_message, we can pull the original message from the 'events' stream and process it */
    // pub original_advisory: Option<Box<MaxDeliverAdvisory>>,
}

/**
 *
 */
#[derive(Debug, EnumString, AsRefStr, Serialize, Deserialize)]
#[strum(serialize_all = "snake_case")]
pub enum EventType {
    #[strum(serialize = "events.totp.requested")]
    TOTPRequested,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum PlutomiEvent {
    TOTPRequested(TOTPRequestedPayload),
}

#[allow(non_snake_case)]
impl PlutomiEvent {
    pub fn event_type(&self) -> EventType {
        match self {
            PlutomiEvent::TOTPRequested(_) => EventType::TOTPRequested,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TOTPRequestedPayload {
    pub email: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum PlutomiEventPayload {
    TOTPRequested(TOTPRequestedPayload),
}
