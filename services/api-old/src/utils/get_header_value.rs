use hyper::HeaderMap;

/**
 * Given a set of headers from a request / response,
 * return the value of the header with a safe default
 */
pub fn get_header_value(header: &str, headers: HeaderMap) -> String {
    headers
        .get(header)
        .and_then(|val| val.to_str().ok()) //
        .unwrap_or("")
        .to_string()
}
