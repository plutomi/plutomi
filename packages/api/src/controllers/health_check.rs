use crate::{
    utils::{
        get_current_time::iso_format,
        logger::{LogLevel, LogObject},
    },
    AppState,
};
use axum::{extract::State, http::StatusCode, Extension, Json};
use mongodb::{bson::doc, options::FindOneOptions};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use time::OffsetDateTime;

#[derive(Serialize, Deserialize)]
pub struct HealthCheckResponse {
    message: &'static str,
    database: bool,
    environment: String,
}

pub async fn health_check(
    State(state): State<AppState>,
    Extension(request_as_hashmap): Extension<HashMap<String, Value>>,
) -> (StatusCode, Json<HealthCheckResponse>) {
    let options: FindOneOptions = {
        let mut options = FindOneOptions::default();
        // This should be less than health check or you can get into a weird state where the health check fails
        // Because the DB is down but the health check is still running and expecting a response
        options.max_time = Some(std::time::Duration::from_millis(1000));
        options
    };
    // Attempt to perform a find_one operation to check database connectivity
    let database_result = state.mongodb.collection.find_one(None, options).await;

    // Check if the database operation was successful
    let database = database_result.is_ok();

    // If the database operation was not successful, log the error
    if let Err(e) = database_result {
        state.logger.log(LogObject {
            level: LogLevel::Error,
            _time: iso_format(OffsetDateTime::now_utc()),
            message: "Failed to connect to database for health check".to_string(),
            data: None,
            error: Some(json!(e.to_string())),
            request: Some(json!(request_as_hashmap.clone())),
            response: None,
        });
    }
    let response: HealthCheckResponse = HealthCheckResponse {
        message: "Saul Goodman",
        database,
        environment: state.env.ENVIRONMENT,
    };

    state.logger.log(LogObject {
        level: match database {
            true => LogLevel::Info,
            false => LogLevel::Error,
        },
        _time: iso_format(OffsetDateTime::now_utc()),
        message: "Health check response".to_string(),
        data: None,
        error: None,
        request: Some(json!(request_as_hashmap)),
        response: Some(json!(&response)),
    });

    (StatusCode::OK, Json(response))
}
