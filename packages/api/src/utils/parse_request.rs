use super::headers_to_hashmap::headers_to_hashmap;
use axum::{
    body::{Body, Bytes},
    extract::Request,
    http::Method,
};
use http_body_util::BodyExt;
use serde_json::{from_slice, json, Value};
use std::collections::HashMap;

pub struct ParsedRequest {
    // We need to recreate the request since we consume the body to extract it as bytes
    // The reason we do this is so that we can actually log it as a json serializable object
    pub original_request: Request,
    // For logging in middleware, we need the body as a json serializable object
    pub request_as_hashmap: HashMap<String, Value>,
}

pub async fn parse_request(request: Request) -> Result<ParsedRequest, String> {
    // Split the request into parts
    let (parts, body) = request.into_parts();

    let mut request_as_hashmap = HashMap::<String, Value>::new();

    request_as_hashmap.insert("method".to_string(), json!(parts.method.to_string()));
    request_as_hashmap.insert("uri".to_string(), json!(parts.uri.to_string()));
    request_as_hashmap.insert(
        "headers".to_string(),
        json!(headers_to_hashmap(&parts.headers)),
    );

    // Only parse the body if the request method is POST or PUT
    let bytes = match parts.method {
        Method::POST | Method::PUT => {
            let bytes = body
                .collect()
                .await
                .map_err(|_e| "Error collecting body into bytes".to_string())?
                .to_bytes();

            if !bytes.is_empty() {
                // Only parse the body if it's not empty
                let body_json = from_slice::<Value>(&bytes)
                    .map_err(|_e| "Error parsing body into hash map".to_string())?;
                request_as_hashmap.insert("body".to_string(), body_json);
            }

            bytes
        }
        // Empty body for GET, DELETE, etc
        _ => Bytes::new(),
    };

    // Once you consume the body, you have to re-create the request
    let original_request = Request::from_parts(parts.clone(), Body::from(bytes.clone()));

    Ok(ParsedRequest {
        original_request,
        request_as_hashmap,
    })
}
