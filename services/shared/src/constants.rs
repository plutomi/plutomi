// TODO make dynamic for prod
pub const BROKERS: &str = "localhost:29092,localhost:39092,localhost:49092";

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
