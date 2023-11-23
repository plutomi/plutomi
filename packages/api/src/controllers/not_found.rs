use axum::http::StatusCode;

pub async fn not_found() -> (StatusCode, &'static str) {
    (StatusCode::NOT_FOUND, "Route Not Found")
}
