use crate::AppState;
use axum::{extract::State, http::StatusCode, Extension, Json};
use serde::{Deserialize, Serialize};
use serde_json::json;
use shared::logger::LogObject;
use std::sync::Arc;

#[derive(Serialize, Deserialize)]
pub struct HealthCheckResponse {
    message: &'static str,
    database: bool,
    environment: String,
    docs_url: String,
}

pub async fn health_check(
    State(state): State<Arc<AppState>>,
    Extension(request_id): Extension<String>,
) -> (StatusCode, Json<HealthCheckResponse>) {
    let response: HealthCheckResponse = HealthCheckResponse {
        message: "Saul Goodman",
        database: false,
        environment: state.env.ENVIRONMENT.clone(),
        docs_url: format!("{}/docs/api", state.env.BASE_WEB_URL),
    };

    state.logger.info(LogObject {
        message: "Health check response".to_string(),
        data: Some(json!({
            "request_id": request_id,
            "response": &response,
        })),
        ..Default::default()
    });

    (StatusCode::OK, Json(response))
}
