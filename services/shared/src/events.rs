use std::str::FromStr;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum PlutomiEventTypes {
    TOTPRequested,
}

impl FromStr for PlutomiEventTypes {
    type Err = ();
    /**
     * Given a string from a message, convert it to a PlutomiEventTypes enum
     */
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "events.totp.requested" => Ok(PlutomiEventTypes::TOTPRequested),
            _ => Err(()),
        }
    }
}

impl PlutomiEventTypes {
    /**
     * Convert the PlutomiEventTypes enum to a string
     *
     * PlutomiEventTypes::TOTPRequested => "events.totp.requested"
     */
    pub fn as_string(&self) -> String {
        let value = match self {
            PlutomiEventTypes::TOTPRequested => "events.totp.requested",
        };

        value.to_string()
    }
}

#[derive(Serialize, Deserialize)]
pub struct PlutomiEvent {
    pub event_type: PlutomiEventTypes,
    pub payload: serde_json::Value,
}
