use rdkafka::producer::FutureProducer;
use shared::{get_env::Env, logger::Logger};

use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub logger: Arc<Logger>,
    pub env: Env,
    pub producer: Arc<FutureProducer>,
}
