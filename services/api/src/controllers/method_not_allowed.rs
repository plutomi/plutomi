use axum::{
    extract::{OriginalUri, Request, State},
    http::{Method, StatusCode},
    middleware::Next,
    response::IntoResponse,
    Extension,
};
use serde_json::{json, Value};
use shared::{
    get_current_time::get_current_time,
    logger::{LogLevel, LogObject},
};
use std::{collections::HashMap, sync::Arc};
use time::OffsetDateTime;

use crate::{
    constants::REQUEST_ID_HEADER,
    structs::{api_error::ApiError, app_state::AppState},
    utils::get_header_value::get_header_value,
};

/**
 * 405 fallback handler. This is needed because of this:
 * https://github.com/tokio-rs/axum/discussions/932#discussioncomment-2559645
 */
pub async fn method_not_allowed(
    State(state): State<Arc<AppState>>,
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
                docs_url: None,
                request_id: get_header_value(REQUEST_ID_HEADER, &request_as_hashmap),
            };

            state.logger.log(LogObject {
                level: LogLevel::Error,
                error: Some(json!(api_error)),
                message,
                data: None,
                _time: get_current_time(OffsetDateTime::now_utc()),
                request: Some(json!(request_as_hashmap)),
                response: None,
            });

            api_error.into_response()
        }

        _ => original_response,
    }
}
