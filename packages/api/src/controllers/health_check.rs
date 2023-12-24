use crate::{
    utils::{get_env::get_env, mongodb::MongoDB},
    AppState,
};
use axum::{extract::State, http::StatusCode, Extension, Json};
use serde::Serialize;
use std::{sync::Arc, time::Duration};
use tokio::time::sleep;

#[derive(Serialize)]
pub struct HealthCheckResponse {
    message: &'static str,
    database: bool,
    environment: String,
}

pub async fn health_check(
    State(state): State<AppState>, // Extracting AppState
) -> (StatusCode, Json<HealthCheckResponse>) {
    let environment = get_env().NEXT_PUBLIC_ENVIRONMENT;
    let response: HealthCheckResponse = HealthCheckResponse {
        message: "Saul Goodman",
        database: state.mongodb.collection.find_one(None, None).await.is_ok(),
        environment,
    };

    tracing::info!("Health check response sent");

    (StatusCode::OK, Json(response))
}
