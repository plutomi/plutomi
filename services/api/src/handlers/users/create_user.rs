use crate::structs::{api_response::ApiResponse, app_state::AppState};
use axum::{http::StatusCode, response::IntoResponse};
use serde_json::json;
use shared::{
    constants::Topics,
    entities::user::{CreateUserOptions, KafkaUser, User},
    events::PlutomiEvent,
    logger::LogObject,
};
use sqlx::{MySql, Transaction};
use std::sync::Arc;

pub async fn create_user(
    state: Arc<AppState>,
    request_id: String,
    body: CreateUserOptions,
) -> impl IntoResponse {
    let mut transaction: Transaction<'_, MySql> = match state.mysql.begin().await {
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
    state.logger.info(LogObject {
        message: "User created".to_string(),
        data: Some(json!({
            "user": get_user_result
        })),
        ..Default::default()
    });

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

    state
        .kafka
        .publish(
            Topics::Test,
            "random",
            &PlutomiEvent::UserCreated(KafkaUser {
                first_name: get_user_result.first_name.clone(),
                last_name: get_user_result.last_name.clone(),
                email: get_user_result.email.clone(),
                public_id: get_user_result.public_id.clone(),
                id: get_user_result.id,
                created_at: get_user_result.created_at,
                updated_at: get_user_result.updated_at,
            }),
        )
        .await
        .unwrap(); // ???

    ApiResponse::success(json!(get_user_result), request_id, StatusCode::CREATED)
}
