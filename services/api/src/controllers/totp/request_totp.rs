use axum::{extract::State, http::StatusCode, Json};
use mongodb::bson::doc;
use serde::Serialize;
use shared::{
    events::{PlutomiEvent, TemplatePayloadDoNotUse},
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
        database: state.mongodb.collection.find_one(doc! {}).await.is_ok(),
        environment: get_env().ENVIRONMENT,
    };

    let event = PlutomiEvent::TemplateDoNotUse(TemplatePayloadDoNotUse {
        email: "test".to_string(),
    });

    // Serialize the event to JSON
    let event_json = serde_json::to_string(&event).unwrap(); // TODO

    let produce_result = state
        .producer
        .send(
            rdkafka::producer::FutureRecord::to("test")
                .payload(&event_json)
                .key("key"),
            std::time::Duration::from_secs(0),
        )
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
