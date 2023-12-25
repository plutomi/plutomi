use crate::{
    utils::{
        get_current_time::iso_format,
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
use time::OffsetDateTime;
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

    sleep(Duration::from_secs(20)).await;
    state.logger.log(LogObject {
        level: LogLevel::Info,
        timestamp: iso_format(OffsetDateTime::now_utc()),
        message: "Health check response sent".to_string(),
        data: Some(json!({ "response": response })),
        error: None,
        request: None,
        response: Some(json!(response)),
    });

    (StatusCode::OK, Json(response))
}
