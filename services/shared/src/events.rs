use serde::{Deserialize, Serialize};
// use strum_macros::{AsRefStr, EnumString};

/**
 *
 */
// #[derive(Debug, EnumString, AsRefStr, Serialize, Deserialize)]
// #[strum(serialize_all = "snake_case")]
// pub enum EventType {
//     #[strum(serialize = "events.totp.requested")]
//     TOTPRequested,
// }

// #[allow(non_snake_case)]
// impl PlutomiEvent {
//     pub fn event_type(&self) -> EventType {
//         match self {
//             PlutomiEvent::TOTPRequested(_) => EventType::TOTPRequested,
//         }
//     }
// }

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "event_type", content = "payload")]
// This tells Serde to look for an event_type field in the input JSON,
// and based on that field, it will deserialize the payload into
// the appropriate variant of PlutomiEvent. The payload field holds the data for each specific event.
pub enum PlutomiEvent {
    #[serde(rename = "totp.requested")]
    TOTPRequested(TOTPRequestedPayload),
    #[serde(rename = "order.created")]
    OrderCreated(OrderCreatedPayload),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TOTPRequestedPayload {
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderCreatedPayload {
    pub order_id: String,
    pub customer_id: String,
    pub total: u64,
}
