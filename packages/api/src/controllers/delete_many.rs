use std::collections::HashMap;

use crate::{
    utils::{
        generate_id::{self, Entities, PlutomiId},
        get_current_time::iso_format,
        logger::{LogLevel, LogObject},
    },
    AppState,
};
use axum::{extract::State, http::StatusCode, Extension, Json};
use mongodb::bson::{doc, to_document};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use time::OffsetDateTime;

#[derive(Serialize, Deserialize)]
pub struct HealthCheckResponse {
    message: &'static str,
    database: bool,
    environment: String,
}

pub async fn delete_many(State(state): State<AppState>) -> (StatusCode, Json<HealthCheckResponse>) {
    let database = state.mongodb.collection.find_one(None, None).await.is_ok();

    state
        .mongodb
        .collection
        .delete_many(doc! {}, None)
        .await
        .unwrap();

    let response: HealthCheckResponse = HealthCheckResponse {
        message: "Deleted Many",
        database,
        environment: state.env.NEXT_PUBLIC_ENVIRONMENT,
    };

    (StatusCode::OK, Json(response))
}
