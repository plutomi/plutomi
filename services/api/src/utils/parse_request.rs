use super::headers_to_hashmap::headers_to_hashmap;
use axum::{
    body::{Body, Bytes},
    extract::Request,
    http::request::Parts,
};
use http_body_util::BodyExt;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct ParsedRequest {
    pub method: String,
    pub path: String,
    pub query: String,
    pub headers: HashMap<String, String>,
    pub body: String,
}

// Sometimes we need the request as a JSON object
pub async fn parse_request(incoming_parts: &Parts, incoming_body_as_bytes: Bytes) -> ParsedRequest {
    let incoming_uri = &incoming_parts.uri;

    // Buffer the body so we can log it

    let incoming_body_string = String::from_utf8_lossy(&incoming_body_as_bytes);

    ParsedRequest {
        method: incoming_parts.method.to_string(),
        headers: headers_to_hashmap(&incoming_parts.headers),
        query: incoming_uri.query().unwrap_or("").to_string(),
        path: incoming_uri.path().to_string(),
        body: incoming_body_string.to_string(),
    }
}
