use super::headers_to_hashmap::headers_to_hashmap;
use axum::{body::Body, http::Response};
use http_body_util::BodyExt;
use serde_json::{from_slice, json, Value};
use std::collections::HashMap;

pub struct ParsedResponse {
    pub original_response: Response<Body>,
    pub response_as_hashmap: HashMap<String, Value>,
}

pub async fn parse_response(response: Response<Body>) -> Result<ParsedResponse, String> {
    // Split the request into parts
    let (parts, body) = response.into_parts();

    // This wont work if the body is an long running stream
    let bytes = body
        .collect()
        .await
        .map_err(|_e| "Error parsing response body".to_string())?
        .to_bytes();

    // Once you consume the body, you have to re-create the request
    let original_response = Response::from_parts(parts.clone(), Body::from(bytes.clone()));

    let mut response_as_hashmap = HashMap::<String, Value>::new();

    response_as_hashmap.insert(
        "headers".to_string(),
        json!(headers_to_hashmap(&parts.headers)),
    );

    response_as_hashmap.insert("status_code".to_string(), json!(parts.status.as_u16()));
    response_as_hashmap.insert(
        "body".to_string(),
        json!(from_slice::<Value>(&bytes)
            .map_err(|_e| { "Error parsing response body".to_string() })?),
    );

    Ok(ParsedResponse {
        original_response,
        response_as_hashmap,
    })
}
