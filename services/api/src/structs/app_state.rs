use shared::{get_env::Env, kafka::KafkaClient, logger::Logger};
use sqlx::mysql::MySqlPool;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub env: Env,
    pub logger: Arc<Logger>,
    pub kafka: Arc<KafkaClient>,
    pub mysql: Arc<MySqlPool>,
}
