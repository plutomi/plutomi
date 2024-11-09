use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PlutomiEvent {
    pub meta: PlutomiMeta,
    pub data: PlutomiData,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlutomiMeta {
    pub event_type: String,
    pub version: String,
}

impl PlutomiEvent {
    pub fn new(payload: PlutomiData) -> Self {
        match payload {
            PlutomiData::TOTPRequested { email, created_at } => Self {
                meta: PlutomiMeta {
                    event_type: "totp-request.created".to_string(),
                    version: "1".to_string(),
                },
                data: PlutomiData::TOTPRequested { email, created_at },
            },
        }
    }
}
#[derive(Debug, Serialize, Deserialize)]
pub enum PlutomiData {
    TOTPRequested {
        email: String,
        created_at: NaiveDateTime,
    },
}
