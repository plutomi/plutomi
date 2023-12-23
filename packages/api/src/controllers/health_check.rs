use crate::utils::{get_env::get_env, mongodb::MongoDB};
use axum::{http::StatusCode, Extension, Json};
use serde::Serialize;
use std::{sync::Arc, time::Duration};
use tokio::time::sleep;

#[derive(Serialize)]
pub struct HealthCheckResponse {
    message: &'static str,
    database: bool,
    timestamp: String,
    environment: String,
}

pub async fn health_check(
    mongodb: Extension<Arc<MongoDB>>,
    timestamp: Extension<String>,
) -> (StatusCode, Json<HealthCheckResponse>) {
    // sleep(Duration::from_secs(5)).await;

    let response: HealthCheckResponse = HealthCheckResponse {
        message: "Saul Goodman",
        timestamp: timestamp.0,
        database: mongodb.collection.find_one(None, None).await.is_ok(),
        environment: get_env().NEXT_PUBLIC_ENVIRONMENT,
    };

    tracing::info!("Health check response sent");

    (StatusCode::OK, Json(response))
}
