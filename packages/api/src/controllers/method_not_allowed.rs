use axum::{
    extract::{OriginalUri, Request, State},
    http::{Method, StatusCode},
    middleware::Next,
    response::IntoResponse,
    Extension,
};
use serde_json::{json, Value};
use std::collections::HashMap;
use time::OffsetDateTime;

use crate::{structs::{app_state::AppState, api_error::ApiError}, utils::{logger::{LogObject, LogLevel}, get_current_time::iso_format}};

// ! TODO this is being duplicated
const REQUEST_ID_HEADER: &str = "x-plutomi-request-id";


pub async fn method_not_allowed(
    State(state): State<AppState>,
    Extension(request_as_hashmap): Extension<HashMap<String, Value>>,
    OriginalUri(uri): OriginalUri,
    method: Method,
    req: Request,
    next: Next,
) -> impl IntoResponse {
    // https://github.com/tokio-rs/axum/discussions/932
    // 405 fallback handler
    let original_response = next.run(req).await;
    let status = original_response.status();

    let message = format!("Method '{}' not allowed at route '{}'", method, uri.path());
    let api_error = ApiError {
        message: message.clone(),
        plutomi_code: None,
        status_code: status.as_u16(),
        docs: None,
        request_id: request_as_hashmap
            .get("headers")
            .and_then(|headers| headers.get(REQUEST_ID_HEADER))
            .and_then(|value| value.as_str())
            .unwrap_or("unknown")
            .to_string(),
    };
    match status {
        StatusCode::METHOD_NOT_ALLOWED => {
            state.logger.log(LogObject {
                level: LogLevel::Error,
                error: Some(json!(api_error.clone())),
                message,
                data: None,
                timestamp: iso_format(OffsetDateTime::now_utc()),
                request: Some(json!(request_as_hashmap)),
                response: None,
            });

            api_error.into_response()
        }

        _ => original_response,
    }
}
