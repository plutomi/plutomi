use crate::utils::connect_to_database::Database;
use axum::{http::StatusCode, Extension, Json};
use futures::stream::TryStreamExt;
use mongodb::bson::Document;
use serde_json::{json, Value};
use std::sync::Arc;

pub async fn health_check(
    mongodb: Extension<Arc<mongodb>>,
    // TODO update types
) -> Result<(StatusCode, Json<Vec<Document>>), (StatusCode, Json<Value>)> {
    // Get a cursor with all items
    let mut items_cursor = match mongodb.collection.find(None, None).await {
        Ok(cursor) => cursor,
        Err(e) => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": format!("Error retrieving data from database: {}", e) })),
            ));
        }
    };

    // Iterate over the cursor and collect the items into a vector
    let mut items: Vec<Document> = Vec::new();
    loop {
        match items_cursor.try_next().await {
            Ok(Some(document)) => items.push(document),
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
