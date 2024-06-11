use crate::utils::{get_env::get_env, mongodb::MongoDB};
use axum::{http::StatusCode, Extension, Json};
use serde::Serialize;
use std::sync::Arc;

#[derive(Serialize)]
pub struct CreateTotpResponse {
    message: &'static str,
    database: bool,
    environment: String,
}

pub async fn request_totp(
    mongodb: Extension<Arc<MongoDB>>,
) -> (StatusCode, Json<CreateTotpResponse>) {
    let response: CreateTotpResponse = CreateTotpResponse {
        message: "TOTP",
        database: mongodb.collection.find_one(None, None).await.is_ok(),
        environment: get_env().ENVIRONMENT,
    };
    (StatusCode::OK, Json(response))
}
