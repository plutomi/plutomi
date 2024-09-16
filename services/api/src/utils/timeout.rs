use std::{sync::Arc, time::Duration};

use super::get_header_value::get_header_value;
use crate::{structs::api_error::ApiError, AppState};
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
    request: Request,
    headers: HeaderMap,
    next: Next,
    Extension(request_id): Extension<String>,
) -> impl IntoResponse {
    let (parts, body) = request.into_parts();

    // Call the next middleware and timeout after 10 seconds
    // Send a response if the timeout is hit
    match tokio::time::timeout(MAX_REQUEST_DURATION, next.run(request)).await {
        Ok(response) => response,
        Err(_) => {
            let status = StatusCode::REQUEST_TIMEOUT;
            let message = "Request took too long to process. Please try again.".to_string();
            state.logger.log(LogObject {
                level: LogLevel::Error,
                _time: get_current_time(OffsetDateTime::now_utc()),
                message: message.clone(),
                data: Some(json!({
                    "request_id": request_id,
                    "method": parts.method.to_string(),
                    "path": parts.uri.path(),
                    "query": parts.uri.query().unwrap_or(""),
                    "headers": headers,
                    "body": body::to_bytes(body).await.unwrap_or_default(),
                })),
                error: None,
                request: None,
                response: None,
            });

            let api_error = ApiError {
                message,
                request_id,
                status_code: status.as_u16(),
                docs_url: None,
                plutomi_code: None,
            };

            api_error.into_response()
        }
    }
}
