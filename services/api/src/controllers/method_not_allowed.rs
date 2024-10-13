use axum::{
    extract::{OriginalUri, Request, State},
    http::{Method, StatusCode},
    middleware::Next,
    response::IntoResponse,
    Extension,
};
use serde_json::json;
use shared::logger::LogObject;
use std::sync::Arc;

use crate::structs::{api_response::ApiResponse, app_state::AppState};

/**
 * 405 fallback handler. This is needed because of this:
 * https://github.com/tokio-rs/axum/discussions/932#discussioncomment-2559645
 */
pub async fn method_not_allowed(
    State(state): State<Arc<AppState>>,
    OriginalUri(uri): OriginalUri,
    Extension(request_id): Extension<String>,
    method: Method,
    req: Request,
    next: Next,
) -> impl IntoResponse {
    // Check the response on the way out
    let original_response = next.run(req).await;
    let status = original_response.status();

    match status {
        StatusCode::METHOD_NOT_ALLOWED => {
            // Overwrite the response with a custom message
            let message: String =
                format!("Method '{}' not allowed at route '{}'", method, uri.path());
            state.logger.error(LogObject {
                message: message.clone(),
                data: Some(json!({
                    "request_id": &request_id,
                })),
                ..Default::default()
            });

            ApiResponse::error(
                message,
                status,
                request_id,
                Some("TODO add docs. Maybe submit a PR? >.<".to_string()),
                None,
                json!({}),
            )
            .into_response()
        }
        _ => original_response,
    }
}
