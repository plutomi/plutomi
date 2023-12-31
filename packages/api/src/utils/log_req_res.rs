use super::{
    generate_plutomiid::{Entities, PlutomiId},
    get_current_time::iso_format,
    logger::{LogLevel, LogObject},
    parse_request::parse_request,
    parse_response::parse_response,
};
use crate::{structs::api_error::ApiError, AppState};
use axum::{
    body::Body,
    extract::{Request, State},
    http::{HeaderValue, Response, StatusCode},
    middleware::Next,
    response::IntoResponse,
};
use serde_json::json;
use time::OffsetDateTime;

const REQUEST_ID_HEADER: &str = "x-plutomi-request-id";
const REQUEST_TIMESTAMP_HEADER: &str = "x-plutomi-request-timestamp";
const RESPONSE_TIMESTAMP_HEADER: &str = "x-plutomi-response-timestamp";
// const CLOUDFLARE_IP_HEADER: &str = "cf-connecting-ip";
const UNKNOWN_HEADER: HeaderValue = HeaderValue::from_static("unknown");

pub async fn log_req_res(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Response<Body> {
    // Start a timer to see how long it takes us to process it
    let start_time = OffsetDateTime::now_utc();
    let formatted_start_time = iso_format(start_time);
    // Add a timestamp header
    request.headers_mut().insert(
        REQUEST_TIMESTAMP_HEADER,
        HeaderValue::from_str(&formatted_start_time).unwrap_or(UNKNOWN_HEADER),
    );

    // Add a request ID based on a PlutomiID
    let request_id = PlutomiId::new(OffsetDateTime::now_utc(), Entities::Request);
    let request_id_value = HeaderValue::from_str(&request_id).unwrap_or(UNKNOWN_HEADER);
    request
        .headers_mut()
        .insert(REQUEST_ID_HEADER, request_id_value.clone());

    // Attempt to parse the request
    let all_request_data = parse_request(request).await;

    match all_request_data {
        Err(message) => {
            // If the REQUEST failed to parse, log it and return a 400
            let end_time = OffsetDateTime::now_utc();
            let formatted_end_time = iso_format(start_time);
            let duration_ms: i128 = (end_time - start_time).whole_milliseconds();

            let status = StatusCode::BAD_REQUEST;
            let api_error = ApiError {
                message: message.clone(),
                plutomi_code: None,
                status_code: status.as_u16(),
                docs: None,
                request_id,
            };

            let response = api_error.clone().into_response();

            let mut parsed_response = parse_response(response).await.unwrap();

            parsed_response.original_response.headers_mut().insert(
                RESPONSE_TIMESTAMP_HEADER,
                HeaderValue::from_str(&formatted_end_time).unwrap(),
            );

            // Log the error
            state.logger.log(LogObject {
                data: Some(json!({ "duration": duration_ms })),
                message,
                timestamp: iso_format(OffsetDateTime::now_utc()),
                level: LogLevel::Error,
                error: Some(json!(api_error)),
                request: None,
                response: Some(json!(parsed_response.response_as_hashmap)),
            });

            parsed_response.original_response
        }
        Ok(mut request_data) => {
            // Log the incoming parsed request - everything is valid form here on out
            state.logger.log(LogObject {
                level: LogLevel::Debug,
                error: None,
                message: "Request received".to_string(),
                data: None,
                timestamp: formatted_start_time,
                request: Some(json!(request_data.request_as_hashmap)),
                response: None,
            });

            request_data
                .original_request
                .extensions_mut()
                .insert(request_data.request_as_hashmap.clone());

            // Call the next middleware and await the response
            let mut response = next.run(request_data.original_request).await;

            // Note how long the request took
            let end_time = OffsetDateTime::now_utc();
            let formatted_end_time = iso_format(end_time);
            let duration_ms: i128 = (end_time - start_time).whole_milliseconds();

            // On the way out, add some headers
            response.headers_mut().insert(
                RESPONSE_TIMESTAMP_HEADER,
                HeaderValue::from_str(&formatted_end_time).unwrap(),
            );

            response
                .headers_mut()
                .insert(REQUEST_ID_HEADER, request_id_value);

            // Log the raw response that is going out
            // Since we are responding, we can be sure the response is serializable
            let parsed_response = parse_response(response).await.unwrap();

            state.logger.log(LogObject {
                level: match parsed_response.original_response.status().as_u16() {
                    400..=599 => LogLevel::Error,
                    _ => LogLevel::Debug,
                },
                error: None,
                message: "Response sent".to_string(),
                data: Some(json!({ "duration": duration_ms })),
                timestamp: formatted_end_time,
                request: Some(json!(&request_data.request_as_hashmap)),
                response: Some(json!(parsed_response.response_as_hashmap)),
            });

            parsed_response.original_response
        }
    }
}
