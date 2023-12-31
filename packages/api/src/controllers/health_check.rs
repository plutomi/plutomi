use std::collections::HashMap;

use crate::{
    utils::{
        get_current_time::iso_format,
        logger::{LogLevel, LogObject},
    },
    AppState,
};
use axum::{extract::State, http::StatusCode, Extension, Json};
use serde::Serialize;
use serde_json::{json, Value};
use time::OffsetDateTime;

#[derive(Serialize)]
pub struct HealthCheckResponse {
    message: &'static str,
    database: bool,
    environment: String,
}

pub async fn health_check(
    Extension(request_as_hashmap): Extension<HashMap<String, Value>>,
    State(state): State<AppState>,
) -> (StatusCode, Json<HealthCheckResponse>) {
    let database = state.mongodb.collection.find_one(None, None).await.is_ok();

    let response: HealthCheckResponse = HealthCheckResponse {
        message: "Saul Goodman",
        database,
        environment: state.env.NEXT_PUBLIC_ENVIRONMENT,
    };


    state.logger.log(LogObject {
        level: match database {
            true => LogLevel::Info,
            false => LogLevel::Error,
        },
        timestamp: iso_format(OffsetDateTime::now_utc()),
        message: "Health check response sent".to_string(),
        data: None,
        error: None,
        request: Some(json!(request_as_hashmap)),
        response: Some(json!(&response)),
    });

    (StatusCode::OK, Json(response))
}
