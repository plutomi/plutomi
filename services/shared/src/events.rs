use serde::{Deserialize, Serialize};
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

#[derive(Debug, Serialize, Deserialize)]
pub enum PlutomiEvent {
    TOTPRequested(TOTPRequestedPayload),
}

#[allow(non_snake_case)]
impl PlutomiEvent {
    // The string representation of the event type
    pub const TOTP_REQUESTED_EVENT: &'static str = "events.totp.requested";

    pub fn event_type(&self) -> &'static str {
        match self {
            PlutomiEvent::TOTPRequested(_) => Self::TOTP_REQUESTED_EVENT,
        }
    }

    // Convert a Jetstream Message to a PlutomiEvent
    pub fn from_jetstream(subject: &str, payload: &[u8]) -> Result<Self, String> {
        match subject {
            TOTP_REQUESTED_EVENT => {
                let payload = serde_json::from_slice(payload)
                    .map_err(|e| format!("Failed to parse TOTP requested payload: {}", e))?;
                Ok(PlutomiEvent::TOTPRequested(payload))
            }
            _ => Err(format!("Unknown event type in from_jetstream: {}", subject)),
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
