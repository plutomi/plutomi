use axum::{extract::State, http::StatusCode, Json};
use serde::Serialize;
use shared::{
    constants::Topics,
    events::{PlutomiEvent, TemplatePayloadDoNotUse, ToKafka},
    get_env::get_env,
};
use std::sync::Arc;

use crate::structs::app_state::AppState;

#[derive(Serialize)]
pub struct CreateTotpResponse {
    message: &'static str,
    database: bool,
    environment: String,
}

pub async fn request_totp(
    State(state): State<Arc<AppState>>,
) -> (StatusCode, Json<CreateTotpResponse>) {
    let response: CreateTotpResponse = CreateTotpResponse {
        message: "TOTP",
        database: false,
        environment: get_env().ENVIRONMENT,
    };

    let event = PlutomiEvent::TemplateDoNotUse(TemplatePayloadDoNotUse {
        email: "test".to_string(),
    });

    let produce_result = state
        .kafka
        .send(Topics::Test, nanoid::nanoid!().as_str(), &event)
        .await;

    match produce_result {
        Ok(_) => {
            println!("Message produced");
        }
        Err(e) => {
            eprintln!("Error producing message: {:?}", e);
        }
    }

    (StatusCode::OK, Json(response))
}
