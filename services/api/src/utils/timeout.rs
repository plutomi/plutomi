use std::collections::HashMap;

use super::{
    get_current_time::iso_format,
    get_header_value::get_header_value,
    logger::{LogLevel, LogObject},
};
use crate::{consts::REQUEST_ID_HEADER, structs::api_error::ApiError, AppState};
use axum::{
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::IntoResponse,
    Extension,
};
use serde_json::{json, Value};
use time::OffsetDateTime;
pub async fn timeout(
    State(state): State<AppState>,
    Extension(request_as_hashmap): Extension<HashMap<String, Value>>,
    request: Request,
    next: Next,
) -> impl IntoResponse {
    // Call the next middleware and timeout after 10 seconds
    // Send a response if the timeout is hit
    match tokio::time::timeout(std::time::Duration::from_secs(10), next.run(request)).await {
        Ok(response) => response,
        Err(_) => {
            let status = StatusCode::REQUEST_TIMEOUT;
            let message = "Request took too long to process. Please try again.".to_string();
            let log_object = LogObject {
                level: LogLevel::Error,
                _time: iso_format(OffsetDateTime::now_utc()),
                message: message.clone(),
                data: None,
                error: None,
                request: Some(json!(&request_as_hashmap)),
                response: None,
            };
            state.logger.log(log_object);

            let api_error = ApiError {
                message,
                request_id: get_header_value(REQUEST_ID_HEADER, &request_as_hashmap),
                status_code: status.as_u16(),
                docs: None,
                plutomi_code: None,
            };

            api_error.into_response()
        }
    }
}
