use crate::utils::{connect_to_mongodb::MongoDB, get_env::get_env};
use axum::{http::StatusCode, Extension, Json};
use serde::Serialize;
use std::sync::Arc;

#[derive(Serialize)]
pub struct CreateTotpResponse {
    message: &'static str,
    database: bool,
    environment: String,
}

pub async fn create_totp(
    mongodb: Extension<Arc<MongoDB>>,
) -> (StatusCode, Json<CreateTotpResponse>) {
    let response: CreateTotpResponse = CreateTotpResponse {
        message: "TOTP2",
        database: mongodb.collection.find_one(None, None).await.is_ok(),
        environment: get_env().NEXT_PUBLIC_ENVIRONMENT,
    };
    (StatusCode::OK, Json(response))
}
