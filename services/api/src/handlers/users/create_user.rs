/**
 * Sample file for an endpoint
 */
use crate::structs::{api_response::ApiResponse, app_state::AppState};
use axum::{http::StatusCode, response::IntoResponse};
use serde_json::json;
use shared::{
    constants::Topics,
    entities::user::{CreateUserOptions, User},
    events::{PlutomiEvent, PlutomiPayload},
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

    let publish_create_user_result = state
        .kafka
        .publish(
            Topics::Auth,
            &user.public_id,
            &PlutomiEvent::new(PlutomiPayload::TOTPRequested {
                email: get_user_result.email.clone(),
                created_at: get_user_result.created_at,
            }),
        )
        .await;

    if let Err(e) = publish_create_user_result {
        state.logger.error(LogObject {
            message: format!("Failed to publish user created event: {}", e),
            data: Some(json!({
                "user": get_user_result
            })),
            ..Default::default()
        });
    }

    ApiResponse::success(json!(get_user_result), request_id, StatusCode::CREATED)
}
