use crate::structs::{api_response::ApiResponse, app_state::AppState};
use axum::{
    extract::{OriginalUri, State},
    http::{Method, StatusCode},
    response::IntoResponse,
    Extension,
};
use serde_json::json;
use shared::logger::LogObject;
use std::sync::Arc;

pub async fn not_found(
    OriginalUri(uri): OriginalUri,
    method: Method,
    Extension(request_id): Extension<String>,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let message = format!("Route at: '{} {}' not found", method, uri.path());

    state.logger.error(LogObject {
        message: message.clone(),
        data: Some(json!({
            "request_id": request_id,
        })),
        ..Default::default()
    });

    ApiResponse::error(
        message,
        StatusCode::NOT_FOUND,
        request_id.clone(),
        Some("TODO add docs. Maybe submit a PR? >.<".to_string()),
        None,
        json!({}),
    )
    .into_response()
}
