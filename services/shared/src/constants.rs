use std::fmt::Display;

use serde::{Deserialize, Serialize};

// TODO make dynamic for prod
pub const BROKERS: &str = "localhost:29092,localhost:39092,localhost:49092";

#[derive(Serialize, Deserialize, Debug)]
pub enum Topics {
    Orders,
    OrdersRetry,
    OrdersDLQ,
}

impl Topics {
    // Convert the enum variant to a string (as Kafka requires topic names as strings)
    pub fn as_str(&self) -> &'static str {
        match self {
            Topics::Orders => "orders",
            Topics::OrdersRetry => "orders-retry",
            Topics::OrdersDLQ => "orders-dlq",
        }
    }
}

impl From<&str> for Topics {
    fn from(topic: &str) -> Self {
        match topic {
            "orders" => Topics::Orders,
            "orders-retry" => Topics::OrdersRetry,
            "orders-dlq" => Topics::OrdersDLQ,
            _ => panic!("Invalid topic: {}", topic), // Panics for invalid topics
        }
    }
}

pub enum ConsumerGroups {
    Notifications,
}

impl ConsumerGroups {
    pub fn as_str(&self) -> &'static str {
        match self {
            ConsumerGroups::Notifications => "notifications",
        }
    }
}
