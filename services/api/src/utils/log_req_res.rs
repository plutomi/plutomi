use crate::{utils::headers_to_hashmap::headers_to_hashmap, AppState};
use axum::{
    body::{Body, Bytes},
    extract::{Request, State},
    http::{HeaderValue, Response},
    middleware::Next,
};
use http_body_util::BodyExt;
use serde::{Deserialize, Serialize};
use serde_json::json;
use shared::{
    entities::Entities,
    generate_id::PlutomiId,
    get_current_time::get_current_time,
    logger::{LogLevel, LogObject},
};
use time::OffsetDateTime;

use std::{collections::HashMap, sync::Arc};

// A deconstructed request that we can log
#[derive(Debug, Clone, Serialize, Deserialize)]
struct OriginalRequest {
    method: String,
    path: String,
    headers: HashMap<String, String>,
    query: String,
    body: String,
    request_id: String,
}

// const CLOUDFLARE_IP_HEADER: &str = "cf-connecting-ip";

/**
 * Logs the incoming request and outgoing response.
 * This should be the first AND last middleware every time.
 */
// Middleware to log request body and other details
pub async fn log_request(
    state: State<Arc<AppState>>,
    req: Request<Body>,
    next: Next,
) -> Response<Body> {
    // Start a timer to see how long it takes us to process it
    let start_time = OffsetDateTime::now_utc();

    // Generate a request ID
    let request_id = PlutomiId::new(&start_time, Entities::Request);

    // Extract the request details
    let (incoming_parts, incoming_body) = req.into_parts();
    let incoming_uri = &incoming_parts.uri;

    //  Extract the body as a string so we can log it
    let incoming_body_as_bytes: Bytes = match incoming_body.collect().await {
        Ok(collected) => collected.to_bytes(),
        Err(_) => Bytes::from(""),
    };

    let incoming_body_string = String::from_utf8_lossy(&incoming_body_as_bytes);

    // Log incoming request
    let original_request = OriginalRequest {
        request_id: request_id.clone(),
        method: incoming_parts.method.to_string(),
        path: incoming_uri.path().to_string(),
        query: incoming_uri.query().unwrap_or("").to_string(),
        headers: headers_to_hashmap(&incoming_parts.headers),
        body: incoming_body_string.to_string(),
    };

    state.logger.log(LogObject {
        level: LogLevel::Debug,
        _time: get_current_time(OffsetDateTime::now_utc()),
        message: "Incoming request".to_string(),
        data: Some(json!({
            "request_id": request_id.clone(),
            "request": &original_request,
        })),
        error: None,
        request: None,
        response: None,
    });

    // Recreate the request with the buffered body
    let new_incoming_body = Body::from(incoming_body_as_bytes);
    let mut reconstructed_request = Request::from_parts(incoming_parts, new_incoming_body);

    // Add request ID to extensions for use in handler responses for easy lookups
    reconstructed_request
        .extensions_mut()
        .insert(request_id.clone());

    // Call the next middleware or handler
    let response = next.run(reconstructed_request).await;

    ////////////////////////////////
    ////////////////////////////////
    ////////////////////////////////
    ////////////////////////////////

    // Log the response on the way out
    let (outgoing_parts, outgoing_body) = response.into_parts();
    let outgoing_status = outgoing_parts.status;
    let outgoing_headers = headers_to_hashmap(&outgoing_parts.headers);

    // Buffer the body so we can log it
    let outgoing_body_bytes: Bytes = match outgoing_body.collect().await {
        Ok(collected) => collected.to_bytes(),
        Err(_) => Bytes::from(""),
    };

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
            "request": original_request,
            "response": json!({
                "status": outgoing_status.as_u16(),
                "headers": outgoing_headers,
                // We don't know the format of the response so just log as string
                "body": outgoing_body_string,
            }),
        })),
        error: None,
        request: None,
        response: None,
    });

    final_response
}
