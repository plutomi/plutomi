use rdkafka::producer::FutureProducer;
use shared::{get_env::Env, logger::Logger, mongodb::MongoDB};

use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub logger: Arc<Logger>,
    pub mongodb: Arc<MongoDB>,
    pub env: Env,
    pub producer: Arc<FutureProducer>,
}
