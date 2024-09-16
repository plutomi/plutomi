use crate::{
    constants::{self, REQUEST_ID_HEADER},
    utils::headers_to_hashmap::headers_to_hashmap,
    AppState,
};
use axum::{
    body::{Body, Bytes},
    extract::{Request, State},
    http::{HeaderValue, Response},
    middleware::Next,
};
use http_body_util::BodyExt;
use serde_json::json;
use shared::{
    entities::Entities,
    generate_id::PlutomiId,
    get_current_time::get_current_time,
    logger::{LogLevel, LogObject},
};

use std::sync::Arc;
use time::OffsetDateTime;

const REQUEST_TIMESTAMP_HEADER: &str = "x-plutomi-request-timestamp";
const RESPONSE_TIMESTAMP_HEADER: &str = "x-plutomi-response-timestamp";
const UNKNOWN_HEADER: HeaderValue = HeaderValue::from_static("unknown");
// const CLOUDFLARE_IP_HEADER: &str = "cf-connecting-ip";

/**
 * Logs the incoming request and outgoing response.
 * This should be the first AND last middleware every time.
 */
// Middleware to log request body and other details
pub async fn log_request(
    state: State<Arc<AppState>>,
    mut req: Request<Body>,
    next: Next,
) -> Result<Response<Body>, axum::Error> {
    // Start a timer to see how long it takes us to process it
    let start_time = OffsetDateTime::now_utc();
    let formatted_start_time = get_current_time(start_time);

    // On the way in, add a timestamp header
    req.headers_mut().insert(
        REQUEST_TIMESTAMP_HEADER,
        HeaderValue::from_str(&formatted_start_time).unwrap_or(UNKNOWN_HEADER),
    );

    let request_id = PlutomiId::new(&start_time, Entities::Request);
    let request_id_value = HeaderValue::from_str(&request_id).unwrap_or(UNKNOWN_HEADER);
    req.headers_mut()
        .insert(REQUEST_ID_HEADER, request_id_value.clone());

    let (incoming_parts, body) = req.into_parts();

    // Extract request details
    let incoming_method = &incoming_parts.method.to_string();
    let incoming_uri = &incoming_parts.uri;
    let incoming_headers = headers_to_hashmap(&incoming_parts.headers);
    let incoming_query = incoming_uri.query().unwrap_or("");
    let incoming_path = incoming_uri.path();

    // Buffer the body so we can log it
    let incoming_body_bytes: Bytes = match body.collect().await {
        Ok(collected) => collected.to_bytes(),
        Err(_) => Bytes::from(""),
    };

    let incoming_body_string = String::from_utf8_lossy(&incoming_body_bytes);

    state.logger.log(LogObject {
        level: LogLevel::Debug,
        _time: get_current_time(OffsetDateTime::now_utc()),
        message: "Incoming request".to_string(),
        data: Some(json!({
            "request_id": request_id,
            "method": incoming_method,
            "path": incoming_path,
            "query": incoming_query,
            "headers": incoming_headers,
            // We don't know what the body is yet, so we'll log it formatted later
            "body": incoming_body_string,
        })),
        error: None,
        request: None,
        response: None,
    });

    // Recreate the request with the buffered body
    let new_incoming_body = Body::from(incoming_body_bytes.clone());
    let reconstructed_request = Request::from_parts(incoming_parts, new_incoming_body);

    // Call the next middleware or handler
    let response = next.run(reconstructed_request).await;

    // Log the response on the way out
    let (outgoing_parts, outgoing_body) = response.into_parts();
    let outgoing_status = outgoing_parts.status;
    let outgoing_headers = headers_to_hashmap(&outgoing_parts.headers);

    // Buffer the body so we can log it
    let outgoing_body_bytes: Bytes = outgoing_body.collect().await?.to_bytes();
    let outgoing_body_string = String::from_utf8_lossy(&outgoing_body_bytes);

    let new_outgoing_body = Body::from(outgoing_body_bytes.clone());
    let final_response = Response::from_parts(outgoing_parts, new_outgoing_body);

    // Note how long the req -> res took
    let end_time = OffsetDateTime::now_utc();
    let duration_ms = (end_time - start_time).whole_milliseconds();

    state.logger.log(LogObject {
        level: LogLevel::Debug,
        _time: get_current_time(OffsetDateTime::now_utc()),
        message: "Outgoing request".to_string(),
        data: Some(json!({
            "duration_ms": duration_ms,
            "request_id": request_id,
            "status": outgoing_status.as_u16(),
            "headers": outgoing_headers,
            // We don't know the format of the response so just log as string
            "body": outgoing_body_string,
        })),
        error: None,
        request: None,
        response: None,
    });

    Ok(final_response)
}
