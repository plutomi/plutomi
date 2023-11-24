use crate::utils::connect_to_database::Database;
use axum::{http::StatusCode, Extension, Json};
use serde_json::{json, Value};
use std::sync::Arc;

pub async fn health_check(
    Extension(database): Extension<Arc<Database>>,
) -> (StatusCode, Json<Value>) {
    let all_items = match database.collection.find(None, None).await {
        Ok(cursor) => {
            let mut items: Vec<Value> = Vec::new();

            while let Some(item) = cursor.next().await {
                match item {
                    Ok(item) => {
                        items.push(json!(item));
                    }
                    Err(e) => {
                        return (
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Json(json!({ "error": e.to_string() })),
                        );
                    }
                }
            }

            items
        }
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": e.to_string() })),
            );
        }
    };

    if all_items.is_empty() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "No items found" })),
        );
    }

    (StatusCode::OK, Json(json!({ "items": all_items })))
}
