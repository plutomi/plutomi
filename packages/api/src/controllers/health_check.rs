use crate::utils::connect_to_database::Database;
use axum::{http::StatusCode, Extension, Json};
use futures::stream::TryStreamExt;
use mongodb::bson::Document;
use serde_json::{json, Value};
use std::sync::Arc;

struct Book {
    title: String,
}
pub async fn health_check(database: Extension<Arc<Database>>) -> (StatusCode, Json<Value>) {
    // let items_cursor = database
    //     .collection
    //     .find(None, None)
    //     .await
    //     .unwrap_or_else(|e| {
    //         (
    //             StatusCode::INTERNAL_SERVER_ERROR,
    //             Json(json!({ "data": 42 })),
    //         )
    //     });

    let items_cursor = database.collection.find(None, None).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            json!({ "error": format!("Error getting item: {}", e) }),
        )
    });

    let mut restaurants: Vec<Document> = Vec::new();
    while let Some(result) = items_cursor.try_next().await {
        match result {
            Ok(doc) => restaurants.push(doc),
            Err(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Error retrieving data from cursor" })),
            ),
        }
    }

    // while let Some(Book) = items_cursor.try_next().await? {
    //     println!("title: {}", book.title);
    // }

    // items_cursor.clone().unwrap_or_else(|e| {
    //     (
    //         StatusCode::INTERNAL_SERVER_ERROR,
    //         json!({ "error": format!("Error getting item: {}", e) }),
    //     );
    // });

    // items_cursor.unwrap().try_next().await.unwrap_or_else(|e| {
    //     (
    //         StatusCode::INTERNAL_SERVER_ERROR,
    //         json!({ "error": format!("Error getting item: {}", e) }),
    //     );
    // });

    // let items: Vec<Value> = items_cursor
    //     .map(|item| {
    //         item.unwrap_or_else(|e| {
    //             (
    //                 StatusCode::INTERNAL_SERVER_ERROR,
    //                 json!({ "error": format!("Error getting item: {}", e) }),
    //             );
    //         })
    //     })
    //     .collect::<Vec<Value>>();

    (StatusCode::OK, Json(json!({ "items": "yeehaw" })))
}
