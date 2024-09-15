use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
// Use `event_type` field to store the variant name and `payload` to store its data
#[serde(tag = "event_type", content = "payload")]
pub enum PlutomiEvent {
    #[serde(rename = "totp.requested")]
    TemplateDoNotUse(TemplatePayloadDoNotUse),
}
#[derive(Debug, Serialize, Deserialize)]
pub struct TemplatePayloadDoNotUse {
    pub email: String,
}
