use crate::utils::connect_to_mongodb::MongoDB;
use axum::{http::StatusCode, Extension, Json};
use serde::Serialize;
use std::sync::Arc;

#[derive(Serialize)]
pub struct HealthCheckResponse {
    message: &'static str,
    server: bool,
    database: bool,
}

pub async fn health_check(
    mongodb: Extension<Arc<MongoDB>>,
) -> (StatusCode, Json<HealthCheckResponse>) {
    let response: HealthCheckResponse = HealthCheckResponse {
        message: "Saul Goodman",
        server: true,
        database: mongodb.collection.find_one(None, None).await.is_ok(),
    };

    (StatusCode::OK, Json(response))
}
