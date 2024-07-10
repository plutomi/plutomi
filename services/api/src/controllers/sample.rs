use crate::structs::app_state::AppState;
use axum::{extract::State, http::StatusCode, Json};
use futures::TryStreamExt;
use mongodb::bson::{doc, Document};
use serde_json::{json, Value};

pub async fn sample(
    State(state): State<AppState>,
) -> Result<(StatusCode, Json<Vec<Document>>), (StatusCode, Json<Value>)> {
    // Get a cursor with all items
    let mut items_cursor = match state.mongodb.collection.find(doc! {}).await {
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
