use std::collections::HashMap;

use crate::{
    utils::{
        generate_id::{self, Entities, PlutomiId},
        get_current_time::iso_format,
        logger::{LogLevel, LogObject},
    },
    AppState,
};
use axum::{
    extract::{Query, State},
    http::{response, StatusCode},
    Extension, Json,
};
use mongodb::{
    bson::{doc, to_document},
    options::DeleteOptions,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use time::OffsetDateTime;

#[derive(Serialize, Deserialize, Debug)]
struct Book {
    _id: String,
    index: u32,
    guid: String,
    is_active: bool,
    balance: String,
    picture: String,
    age: u32,
    eye_color: String,
    gender: String,
    name: String,
    company: String,
    email: String,
    phone: String,
    address: String,
    address2: String,
    address3: String,
    address4: String,
    about: String,
    registered: String,
    latitude: f64,
    longitude: f64,
    tags: Vec<String>,
    friends: Vec<HashMap<String, String>>,
    greeting: String,
    favorite_fruit: String,
}

#[derive(Serialize, Deserialize)]
pub struct DeleteManyResponse {
    message: &'static str,
    database: bool,
    environment: String,
}

pub async fn delete_many(State(state): State<AppState>) -> (StatusCode, Json<DeleteManyResponse>) {
    // Just for testing
    let delete_result = state.mongodb.collection.delete_many(doc! {}, None).await;

    let response: DeleteManyResponse = DeleteManyResponse {
        message: match delete_result {
            Ok(_) => "Deleted Many",
            Err(_) => "Failed to delete many",
        },
        database: true,
        environment: state.env.NEXT_PUBLIC_ENVIRONMENT,
    };
    (StatusCode::OK, Json(response))
}
