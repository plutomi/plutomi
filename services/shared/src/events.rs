use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PlutomiEvent {
    pub event_type: String,
    pub version: String,
    pub payload: PlutomiPayload,
}

impl PlutomiEvent {
    pub fn new(payload: PlutomiPayload) -> Self {
        match payload {
            PlutomiPayload::TOTPRequested { email, created_at } => Self {
                event_type: "totp-request.created".to_string(),
                version: "1".to_string(),
                payload: PlutomiPayload::TOTPRequested { email, created_at },
            },
        }
    }
}
#[derive(Debug, Serialize, Deserialize)]
pub enum PlutomiPayload {
    TOTPRequested {
        email: String,
        created_at: NaiveDateTime,
    },
}
