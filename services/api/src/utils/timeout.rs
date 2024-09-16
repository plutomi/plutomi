use std::{sync::Arc, time::Duration};

use super::get_header_value::get_header_value;
use crate::{
    structs::api_response::{ApiError, ApiResponse},
    AppState,
};
use axum::{
    body,
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::IntoResponse,
    Extension,
};
use hyper::HeaderMap;
use serde_json::json;
use shared::{
    get_current_time::get_current_time,
    logger::{LogLevel, LogObject},
};

use time::OffsetDateTime;

const MAX_REQUEST_DURATION: Duration = Duration::from_secs(10);

pub async fn timeout(
    State(state): State<Arc<AppState>>,
    Extension(request_id): Extension<String>,
    request: Request,
    next: Next,
) -> impl IntoResponse {
    // Call the next middleware and timeout after 10 seconds
    // Send a response if the timeout is hit
    match tokio::time::timeout(MAX_REQUEST_DURATION, next.run(request)).await {
        Ok(response) => ApiResponse::success(response.body(), request_id),
        Err(_) => {
            let message = "Request took too long to process. Please try again.".to_string();
            state.logger.log(LogObject {
                level: LogLevel::Error,
                _time: get_current_time(OffsetDateTime::now_utc()),
                message: message.clone(),
                data: Some(json!({
                    "request_id": request_id,
                })),
                error: None,
                request: None,
                response: None,
            });

            ApiResponse::error(
                message,
                status_code,
                request_id,
                docs_url: None,
                plutomi_code: None,
                data: None,
            )
        }
    }
}
