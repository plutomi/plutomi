use crate::structs::{api_response::ApiError, app_state::AppState};
use axum::{
    extract::{OriginalUri, State},
    http::{Method, StatusCode},
    response::IntoResponse,
    Extension,
};
use serde_json::json;
use shared::{
    get_current_time::get_current_time,
    logger::{LogLevel, LogObject},
};
use std::sync::Arc;

pub async fn not_found(
    OriginalUri(uri): OriginalUri,
    method: Method,
    Extension(request_id): Extension<String>,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let not_found_message = format!("Route at: '{} {}' not found", method, uri.path());

    let status = StatusCode::NOT_FOUND;

    state.logger.log(LogObject {
        level: LogLevel::Error,
        _time: get_current_time(time::OffsetDateTime::now_utc()),
        message: not_found_message.clone(),
        data: Some(json!({
            "request_id": request_id,
        })),
        error: None,
        request: None,
        response: None,
    });

    let api_error = ApiError {
        message: not_found_message.clone(),
        plutomi_code: None,
        status_code: status.as_u16(),
        docs_url: None,
        request_id,
    };

    api_error.into_response()
}
