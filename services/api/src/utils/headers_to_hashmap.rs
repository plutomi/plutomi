use axum::http::HeaderMap;
use std::collections::HashMap;

// When logging, this helps format the JSON serialized req/res headers
pub fn headers_to_hashmap(headers: &HeaderMap) -> HashMap<String, String> {
    headers
        .iter()
        .map(|(key, value)| {
            (
                key.to_string(),
                value.to_str().unwrap_or("unknown").to_string(),
            )
        })
        .collect()
}
