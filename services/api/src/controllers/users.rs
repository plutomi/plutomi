use crate::structs::{api_response::ApiResponse, app_state::AppState};
use axum::{extract::State, http::StatusCode, response::IntoResponse, Extension, Json};
use chrono::{DateTime, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::json;
use shared::{get_current_time::get_current_time, logger::LogObject};
use sqlx::{MySql, Transaction};
use std::sync::Arc;
use time::OffsetDateTime;

#[derive(Deserialize, Serialize, Debug)]
pub struct NewUser {
    first_name: String,
    last_name: String,
    email: String,
}

#[derive(Serialize, Debug)]
pub struct User {
    id: i64,
    first_name: String,
    last_name: String,
    email: String,
    created_at: NaiveDateTime,
    updated_at: NaiveDateTime,
}

pub async fn post_users(
    State(state): State<Arc<AppState>>,
    Extension(request_id): Extension<String>,
    Json(new_user): Json<NewUser>,
) -> impl IntoResponse {
    let now: NaiveDateTime = Utc::now().naive_utc(); // Use NaiveDateTime
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

    match sqlx::query!(
        r#"
        INSERT INTO users (first_name, last_name, email, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?)
        "#,
        new_user.first_name,
        new_user.last_name,
        new_user.email,
        now,
        now
    )
    .execute(&mut *transaction)
    .await
    {
        Ok(result) => {
            let last_insert_id = result.last_insert_id();
            let message = "User created successfully".to_string();
            match sqlx::query_as!(
                User,
                r#"
                SELECT *
                FROM users
                WHERE id = ?
                "#,
                last_insert_id
            )
            .fetch_one(&mut *transaction)
            .await
            {
                Ok(user) => {
                    // Commit the transaction if everything succeeds
                    if let Err(e) = transaction.commit().await {
                        return ApiResponse::error(
                            format!("Failed to commit transaction: {}", e),
                            StatusCode::INTERNAL_SERVER_ERROR,
                            request_id.clone(),
                            None,
                            None,
                            json!({}),
                        );
                    }

                    ApiResponse::success(
                        json!({ "message": "User created successfully", "user": user }),
                        request_id,
                        StatusCode::CREATED,
                    )
                }
                Err(e) => {
                    let message = format!("Failed to fetch user: {}", e);
                    state.logger.error(LogObject {
                        message: message.clone(),
                        data: Some(json!({
                            "request_id": request_id.clone(),
                        })),
                        ..Default::default()
                    });

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
        Err(e) => {
            let message = format!("Failed to insert user: {}", e);
            state.logger.error(LogObject {
                message: message.clone(),
                data: Some(json!({
                    "request_id": request_id.clone(),
                })),
                ..Default::default()
            });

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
