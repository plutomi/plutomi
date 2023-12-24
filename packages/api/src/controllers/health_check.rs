use crate::{
    utils::{
        get_current_time::get_current_time,
        get_env::get_env,
        logger::{LogLevel, LogObject},
        mongodb::MongoDB,
    },
    AppState,
};
use axum::{extract::State, http::StatusCode, Extension, Json};
use serde::Serialize;
use serde_json::json;
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

    state.logger.log(LogObject {
        level: LogLevel::Info,
        timestamp: get_current_time(),
        message: "Health check response sent".to_string(),
        data: Some(json!({ "response": response })),
        error: None,
        request: None,
    });

    (StatusCode::OK, Json(response))
}
