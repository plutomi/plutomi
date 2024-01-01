use super::{
    generate_id::{Entities, PlutomiId},
    get_current_time::iso_format,
    logger::{LogLevel, LogObject},
    parse_request::parse_request,
    parse_response::parse_response,
};
use crate::{consts, structs::api_error::ApiError, AppState};
use axum::{
    body::Body,
    extract::{Request, State},
    http::{HeaderValue, Response, StatusCode},
    middleware::Next,
    response::IntoResponse,
};
use serde_json::json;
use time::OffsetDateTime;

const REQUEST_TIMESTAMP_HEADER: &str = "x-plutomi-request-timestamp";
const RESPONSE_TIMESTAMP_HEADER: &str = "x-plutomi-response-timestamp";
const UNKNOWN_HEADER: HeaderValue = HeaderValue::from_static("unknown");
// const CLOUDFLARE_IP_HEADER: &str = "cf-connecting-ip";
use consts::REQUEST_ID_HEADER;

/**
 * Logs the incoming request and outgoing response. This should be the first AND last middleware every time.
 *
 */
pub async fn log_req_res(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Response<Body> {
    // Start a timer to see how long it takes us to process it
    let start_time = OffsetDateTime::now_utc();
    let formatted_start_time = iso_format(start_time);

    // On the way in, add a timestamp header
    request.headers_mut().insert(
        REQUEST_TIMESTAMP_HEADER,
        HeaderValue::from_str(&formatted_start_time).unwrap_or(UNKNOWN_HEADER),
    );

    // Add a request ID header
    let request_id = PlutomiId::new(&start_time, Entities::Request);
    let request_id_value = HeaderValue::from_str(&request_id).unwrap_or(UNKNOWN_HEADER);
    request
        .headers_mut()
        .insert(REQUEST_ID_HEADER, request_id_value.clone());

    // Attempt to parse the request
    let all_request_data = parse_request(request).await;

    match all_request_data {
        Err(message) => {
            // If the incoming request failed to parse, log it and return a 400
            let end_time = OffsetDateTime::now_utc();
            let formatted_end_time = iso_format(end_time);
            let duration_ms: i128 = (end_time - start_time).whole_milliseconds();

            let status = StatusCode::BAD_REQUEST;
            let api_error = ApiError {
                message: message.clone(),
                plutomi_code: None,
                status_code: status.as_u16(),
                docs: None,
                request_id,
            };

            // Create a response
            let response = api_error.clone().into_response();
            let mut parsed_response = parse_response(response).await.unwrap();

            // On the way out, add a timestamp header
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
            // If we successfully parsed the request, log it
            state.logger.log(LogObject {
                level: LogLevel::Debug,
                error: None,
                message: "Request received".to_string(),
                data: None,
                timestamp: iso_format(OffsetDateTime::now_utc()),
                request: Some(json!(request_data.request_as_hashmap)),
                response: None,
            });

            // Add the request data as an Axum extension so we can access it later if needed
            request_data
                .original_request
                .extensions_mut()
                .insert(request_data.request_as_hashmap.clone());

            // Call the next middleware and await the response
            let mut response = next.run(request_data.original_request).await;

            // Note how long the req -> res took
            let end_time = OffsetDateTime::now_utc();
            let formatted_end_time = iso_format(end_time);
            let duration_ms = (end_time - start_time).whole_milliseconds();

            // Add a timestamp header on the way out
            response.headers_mut().insert(
                RESPONSE_TIMESTAMP_HEADER,
                HeaderValue::from_str(&formatted_end_time).unwrap(),
            );

            // Add the request ID header on the way out to help with debugging if needed
            response
                .headers_mut()
                .insert(REQUEST_ID_HEADER, request_id_value);

            // Since we are responding, we can be sure the response is serializable as it will always be JSON
            let parsed_response = parse_response(response).await.unwrap();

            // Log the response
            state.logger.log(LogObject {
                level: match parsed_response.original_response.status().as_u16() {
                    400..=599 => LogLevel::Error,
                    _ => LogLevel::Debug,
                },
                error: None,
                message: "Response sent".to_string(),
                data: Some(json!({ "duration": duration_ms })),
                timestamp: iso_format(OffsetDateTime::now_utc()),
                request: Some(json!(&request_data.request_as_hashmap)),
                response: Some(json!(parsed_response.response_as_hashmap)),
            });

            parsed_response.original_response
        }
    }
}
