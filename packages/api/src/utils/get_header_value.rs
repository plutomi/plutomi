use serde_json::Value;
use std::collections::HashMap;

/**
 * Given a set of headers from a request / response hash map, return the value of the header with a safe default
 */
pub fn get_header_value(header: &str,hashmap: &HashMap<String, Value>) -> String {
    hashmap
        .get("headers")
        .and_then(|headers| headers.get(header))
        .and_then(|value| value.as_str())
        .unwrap_or("unknown")
        .to_string()
}
