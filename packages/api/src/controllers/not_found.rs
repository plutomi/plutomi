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
        message: format!(
            "Route at: '{} {}' not found - Check {}/api to view the docs.",
            method,
            uri,
            &crate::utils::get_env::get_env().NEXT_PUBLIC_BASE_URL
        ),
    };
    (StatusCode::NOT_FOUND, Json(response))
}
