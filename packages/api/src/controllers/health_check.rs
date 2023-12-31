use crate::{
    utils::{
        get_current_time::iso_format,
        logger::{LogLevel, LogObject},
    },
    AppState,
};
use axum::{extract::State, http::StatusCode, Json};
use serde::Serialize;
use serde_json::json;
use time::OffsetDateTime;

#[derive(Serialize)]
pub struct HealthCheckResponse {
    message: &'static str,
    database: bool,
    environment: String,
}

pub async fn health_check(
    State(state): State<AppState>,
) -> (StatusCode, Json<HealthCheckResponse>) {
    let response: HealthCheckResponse = HealthCheckResponse {
        message: "Saul Goodman",
        database: state.mongodb.collection.find_one(None, None).await.is_ok(),
        environment: state.env.NEXT_PUBLIC_ENVIRONMENT,
    };

    // sleep(Duration::from_secs(20)).await;
    state.logger.log(LogObject {
        level: LogLevel::Info,
        timestamp: iso_format(OffsetDateTime::now_utc()),
        message: "Health check response sent".to_string(),
        data: Some(json!(response)),
        error: None,
        request: None,
        response: None,
    });

    (StatusCode::OK, Json(response))
}
