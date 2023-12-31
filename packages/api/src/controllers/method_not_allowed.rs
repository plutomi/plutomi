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

use crate::{
    consts::REQUEST_ID_HEADER,
    structs::{api_error::ApiError, app_state::AppState},
    utils::{
        get_current_time::iso_format,
        get_header_value::get_header_value,
        logger::{LogLevel, LogObject},
    },
};

/**
 * 405 fallback handler. This is needed because of this:
 * https://github.com/tokio-rs/axum/discussions/932#discussioncomment-2559645
 */
pub async fn method_not_allowed(
    State(state): State<AppState>,
    Extension(request_as_hashmap): Extension<HashMap<String, Value>>,
    OriginalUri(uri): OriginalUri,
    method: Method,
    req: Request,
    next: Next,
) -> impl IntoResponse {
    // Check the response on the way out
    let original_response = next.run(req).await;
    let status = original_response.status();

    match status {
        StatusCode::METHOD_NOT_ALLOWED => {
            // Overwrite the response with a custom message
            let message = format!("Method '{}' not allowed at route '{}'", method, uri.path());
            let api_error = ApiError {
                message: message.clone(),
                plutomi_code: None,
                status_code: status.as_u16(),
                docs: None,
                request_id: get_header_value(REQUEST_ID_HEADER, &request_as_hashmap),
            };

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
