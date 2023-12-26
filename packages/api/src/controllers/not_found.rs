use axum::{
    extract::OriginalUri,
    http::{Method, StatusCode},
    Json,
};

#[derive(serde::Serialize)]
pub struct NotFoundResponse {
    message: String,
}

pub async fn not_found(
    OriginalUri(uri): OriginalUri,
    method: Method,
) -> (StatusCode, Json<NotFoundResponse>) {
    let response = NotFoundResponse {
        message: format!("Route at: '{} {}' not found", method, uri.path()),
    };
    (StatusCode::NOT_FOUND, Json(response))
}
