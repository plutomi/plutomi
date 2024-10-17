use shared::{get_env::Env, logger::Logger};
use std::sync::Arc;

use crate::utils::kafka::KafkaClient;

#[derive(Clone)]
pub struct AppState {
    pub env: Env,
    pub logger: Arc<Logger>,
    pub kafka: Arc<KafkaClient>,
    pub mysql: sqlx::mysql::MySqlPool,
}
