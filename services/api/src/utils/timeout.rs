use crate::{structs::api_response::ApiResponse, AppState};
use axum::{
    extract::{Request, State},
    middleware::Next,
    response::IntoResponse,
    Extension,
};
use hyper::StatusCode;
use serde_json::json;
use shared::{
    get_current_time::get_current_time,
    logger::{LogLevel, LogObject},
};
use std::{sync::Arc, time::Duration};

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
        Ok(response) => response,
        Err(_) => {
            let message = "Request took too long to process. Please try again.".to_string();
            state.logger.log(LogObject {
                level: LogLevel::Error,
                _time: get_current_time(OffsetDateTime::now_utc()),
                message: message.clone(),
                data: Some(json!({
                    "request_id": request_id.clone(),
                })),
                error: None,
                request: None,
                response: None,
            });

            let api_error_response = ApiResponse::error(
                message,
                StatusCode::REQUEST_TIMEOUT,
                request_id.clone(),
                Some("TODO add docs. Maybe submit a PR? >.<".to_string()),
                None,
                json!({}),
            );

            // Return the error response
            api_error_response.into_response()
        }
    }
}
