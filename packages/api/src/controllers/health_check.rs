use crate::utils::{connect_to_mongodb::MongoDB, get_env::get_env};
use axum::{http::StatusCode, Extension, Json};
use serde::Serialize;
use std::sync::Arc;

#[derive(Serialize)]
pub struct HealthCheckResponse {
    message: &'static str,
    database: bool,
    environment: String,
}

pub async fn health_check(
    mongodb: Extension<Arc<MongoDB>>,
) -> (StatusCode, Json<HealthCheckResponse>) {
    let response: HealthCheckResponse = HealthCheckResponse {
        message: "Saul Goodman",
        database: mongodb.collection.find_one(None, None).await.is_ok(),
        environment: get_env().NEXT_PUBLIC_ENVIRONMENT,
    };

    (StatusCode::OK, Json(response))
}
