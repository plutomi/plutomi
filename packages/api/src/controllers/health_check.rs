use axum::http::StatusCode;

pub async fn health_check() -> (StatusCode, &'static str) {
    (StatusCode::OK, "Hello from Plutomi!")
}
