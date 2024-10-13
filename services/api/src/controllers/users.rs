use crate::structs::{api_response::ApiResponse, app_state::AppState};
use axum::{response::IntoResponse, Extension, Json};
use hyper::StatusCode;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Deserialize, Serialize, Debug)]
struct NewUser {
    first_name: String,
    last_name: String,
    email: String,
}

pub async fn post_users(
    state: AppState,
    Json(user): Json<NewUser>,
    Extension(request_id): Extension<String>,
) -> impl IntoResponse {
    match sqlx::query!(
        r#"
        INSERT INTO users (first_name, last_name, email) 
        VALUES ($1, $2, $3)
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
