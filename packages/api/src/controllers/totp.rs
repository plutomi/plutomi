pub mod totp_post;

pub struct Totp;

use crate::utils::{connect_to_mongodb::MongoDB, get_env::get_env};
use axum::{http::StatusCode, Extension, Json};
use serde::Serialize;
use std::sync::Arc;

#[derive(Serialize)]
pub struct TotpResponse {
    message: &'static str,
    database: bool,
    deployment_environment: String,
}

impl Totp {
    pub async fn create(mongodb: Extension<Arc<MongoDB>>) -> (StatusCode, Json<TotpResponse>) {
        create_totp(mongodb).await
    }
}
