use shared::get_env::Env;

use crate::utils::{logger::Logger, mongodb::MongoDB};
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub logger: Arc<Logger>,
    pub mongodb: Arc<MongoDB>,
    pub env: Env,
}
