use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};
use time::OffsetDateTime;

#[derive(Serialize, Deserialize, Debug)]
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

    // Convert a Jetstream Message to a PlutomiEvent
    pub fn from_jetstream(subject: &str, payload: &[u8]) -> Result<Self, String> {
        match subject.parse::<EventType>() {
            Ok(EventType::TOTPRequested) => {
                let payload = serde_json::from_slice(payload)
                    .map_err(|e| format!("Failed to parse TOTP requested payload: {}", e))?;
                Ok(PlutomiEvent::TOTPRequested(payload))
            }
            Err(_) => Err(format!("Unknown event type in from_jetstream: {}", subject)),
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
