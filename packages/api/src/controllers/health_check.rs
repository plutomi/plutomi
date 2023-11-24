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

    let mut items: Vec<Document> = Vec::new();
    (
        StatusCode::OK,
        Json(items_cursor.try_collect().await.unwrap()),
    )
    // let mut items: Vec<Document> = Vec::new();

    // while let Some(result) = items_cursor.unwrap().try_next().await {
    //     match result {
    //         Ok(doc) => items.push(doc),
    //         Err(_) => {
    //             return Err((
    //                 StatusCode::INTERNAL_SERVER_ERROR,
    //                 Json(json!({ "message": "Error retrieving data from cursor" })),
    //             ));
    //         }
    //     }
    // }

    // while let Some(Book) = items_cursor.try_next().await? {
    //     println!("title: {}", book.title);
    // }

    // items_cursor.clone().unwrap_or_else(|e| {
    //     (
    //         StatusCode::INTERNAL_SERVER_ERROR,
    //         json!({ "error": format!("Error getting item: {}", e) }),
    //     );
    // });
}
