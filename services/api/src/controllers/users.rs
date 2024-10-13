use crate::structs::{api_response::ApiResponse, app_state::AppState};
use axum::{extract::State, http::StatusCode, response::IntoResponse, Extension, Json};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;

#[derive(Deserialize, Serialize, Debug)]
pub struct NewUser {
    first_name: String,
    last_name: String,
    email: String,
}

pub async fn post_users(
    State(state): State<Arc<AppState>>,
    Json(new_user): Json<NewUser>,
    Extension(request_id): Extension<String>,
) -> impl IntoResponse {
    match sqlx::query!(
        r#"
        INSERT INTO users (first_name, last_name, email) 
        VALUES (?, ?, ?)
        "#,
        new_user.first_name,
        new_user.last_name,
        new_user.email
    )
    .execute(&state.db)
    .await
    {
        Ok(_) => {
            let message = "User created successfully".to_string();
            ApiResponse::success(
                json!({
                    "message": message,
                }),
                request_id.clone(),
                StatusCode::NOT_FOUND,
            )
        }
        Err(e) => {
            let message = format!("Failed to insert user: {}", e);
            ApiResponse::error(
                message,
                StatusCode::INTERNAL_SERVER_ERROR,
                request_id.clone(),
                Some("TODO add docs. Maybe submit a PR? >.<".to_string()),
                None,
                json!({}),
            )
        }
    }
}
