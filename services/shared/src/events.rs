use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PlutomiMessage {
    pub event_type: String,
    pub version: String,
    pub payload: PlutomiPayload,
}

#[derive(Debug, Serialize, Deserialize)]
// Use `event_type` field to store the variant name and `payload` to store its data
#[serde(tag = "event_type", content = "payload")]
pub enum PlutomiPayload {
    #[serde(rename = "totp-request.created")]
    TOTPRequested(TOTPRequestedPayload),
}
#[derive(Debug, Serialize, Deserialize)]
pub struct TOTPRequestedPayload {
    pub email: String,
}

// TODO: Placeholder
#[derive(Debug, Serialize, Deserialize)]
pub struct UserCreated {
    pub email: String,
}
