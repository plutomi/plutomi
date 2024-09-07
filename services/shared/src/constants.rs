// TODO make dynamic for prod
pub const BROKERS: &str = "localhost:29092,localhost:39092,localhost:49092";

pub struct Topics;

impl Topics {
    pub const ORDERS: &'static str = "orders";
    pub const ORDERS_RETRY: &'static str = "orders-retry";
    pub const ORDERS_DLQ: &'static str = "orders-dlq";
}
