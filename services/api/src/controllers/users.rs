use crate::structs::{api_response::ApiResponse, app_state::AppState};
use axum::{extract::State, http::StatusCode, response::IntoResponse, Extension, Json};
use serde_json::json;
use shared::entities::user::{CreateUserOptions, User};
use sqlx::{MySql, Transaction};
use std::sync::Arc;

pub async fn post_users(
    State(state): State<Arc<AppState>>,
    Extension(request_id): Extension<String>,
    Json(body): Json<CreateUserOptions>,
) -> impl IntoResponse {
    let mut transaction: Transaction<'_, MySql> = match state.db.begin().await {
        Ok(tx) => tx,
        Err(e) => {
            return ApiResponse::error(
                format!("Failed to start transaction: {}", e),
                StatusCode::INTERNAL_SERVER_ERROR,
                request_id.clone(),
                None,
                None,
                json!({}),
            )
        }
    };

    let user = User::new(body);

    let insert_result = match sqlx::query_as!(
        User,
        r#"
        INSERT INTO users (first_name, last_name, email, created_at, updated_at, public_id) 
        VALUES (?, ?, ?, ?, ?, ?)
        "#,
        user.first_name,
        user.last_name,
        user.email,
        user.created_at,
        user.updated_at,
        user.public_id
    )
    .execute(&mut *transaction)
    .await
    {
        Ok(result) => result,
        Err(e) => {
            return ApiResponse::error(
                format!("Failed to insert user: {}", e),
                StatusCode::INTERNAL_SERVER_ERROR,
                request_id.clone(),
                None,
                None,
                json!({}),
            )
        }
    };

    let user_id = insert_result.last_insert_id();

    let get_user_result = match sqlx::query_as!(
        User,
        r#"
        SELECT * 
        FROM users
        WHERE id = ?
        LIMIT 1
        "#,
        user_id
    )
    .fetch_one(&mut *transaction)
    .await
    {
        Ok(user) => user,
        Err(e) => {
            return ApiResponse::error(
                format!("Failed to create user {}", e),
                StatusCode::INTERNAL_SERVER_ERROR,
                request_id.clone(),
                None,
                None,
                json!({}),
            )
        }
    };

    // Commit the transaction if everything succeeds
    if let Err(e) = transaction.commit().await {
        return ApiResponse::error(
            format!("Failed to create user: {}", e),
            StatusCode::INTERNAL_SERVER_ERROR,
            request_id.clone(),
            None,
            None,
            json!({}),
        );
    }

    ApiResponse::success(json!(get_user_result), request_id, StatusCode::CREATED)
}
