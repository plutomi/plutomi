use crate::utils::connect_to_database::Database;
use axum::{http::StatusCode, Extension, Json};
use futures::TryStreamExt;

use mongodb::bson::Document;
use serde_json::{json, Value};
use std::sync::Arc;

struct Book {
    title: String,
}
pub async fn health_check(
    database: Extension<Arc<Database>>,
) -> Result<(StatusCode, Json<Vec<Document>>), (StatusCode, Json<Value>)> {
    // Get a cursor with all items
    let items_cursor = match database.collection.find(None, None).await {
        Ok(cursor) => cursor,
        Err(_) => {
            return Err((
                StatusCode::FAILED_DEPENDENCY,
                Json(json!({ "message": "Error retrieving data from cursor" })),
            ));
        }
    };

    // Iterate over the cursor and collect the items into a vector
    let mut items: Vec<Document> = Vec::new();

    while let Some(result) = items_cursor.try_next().await {
        match result {
            Ok(Some(doc)) => items.push(doc),
            Ok(None) => break,
            Err(e) => {
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(
                        json!({ "message": format!("Error retrieving data from database: {}", e) }),
                    ),
                ));
            }
        }
    }

    Ok((StatusCode::OK, Json(items)))
}
