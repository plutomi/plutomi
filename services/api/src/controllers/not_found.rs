use std::collections::HashMap;

use axum::{
    extract::{OriginalUri, State},
    http::{Method, StatusCode},
    response::IntoResponse,
    Extension,
};
use serde_json::{json, Value};
use shared::{get_current_time::get_current_time, logger::{LogLevel, LogObject}};

use crate::{
    consts::REQUEST_ID_HEADER,
    structs::{api_error::ApiError, app_state::AppState},
    utils::get_header_value::get_header_value,
};

pub async fn not_found(
    Extension(request_as_hashmap): Extension<HashMap<String, Value>>,
    OriginalUri(uri): OriginalUri,
    method: Method,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let not_found_message = format!("Route at: '{} {}' not found", method, uri.path());

    let status = StatusCode::NOT_FOUND;
    let api_error = ApiError {
        message: not_found_message.clone(),
        plutomi_code: None,
        status_code: status.as_u16(),
        docs_url: None,
        request_id: get_header_value(REQUEST_ID_HEADER, &request_as_hashmap),
    };

    state.logger.log(LogObject {
        level: LogLevel::Error,
        _time: get_current_time(time::OffsetDateTime::now_utc()),
        message: not_found_message,
        data: None,
        error: None,
        request: Some(json!(request_as_hashmap)),
        response: Some(json!(&api_error)),
    });

    api_error.into_response()
}
