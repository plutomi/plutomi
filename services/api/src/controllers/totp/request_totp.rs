use axum::{http::StatusCode, Extension, Json};
use mongodb::bson::doc;
use serde::Serialize;
use shared::{get_env::get_env, mongodb::MongoDB};
use std::sync::Arc;

#[derive(Serialize)]
pub struct CreateTotpResponse {
    message: &'static str,
    database: bool,
    environment: String,
}

pub async fn request_totp(
    mongodb: Extension<Arc<MongoDB>>,
) -> (StatusCode, Json<CreateTotpResponse>) {
    let response: CreateTotpResponse = CreateTotpResponse {
        message: "TOTP",
        database: mongodb.collection.find_one(doc! {}).await.is_ok(),
        environment: get_env().ENVIRONMENT,
    };
    (StatusCode::OK, Json(response))
}
