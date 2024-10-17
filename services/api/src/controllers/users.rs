use crate::handlers::users::create_user::create_user;
use crate::structs::app_state::AppState;
use axum::{extract::State, response::IntoResponse, Extension, Json};
use shared::entities::user::CreateUserOptions;
use std::sync::Arc;

pub async fn post_users(
    State(state): State<Arc<AppState>>,
    Extension(request_id): Extension<String>,
    Json(body): Json<CreateUserOptions>,
) -> impl IntoResponse {
    return create_user(state, request_id, body).await;
}
