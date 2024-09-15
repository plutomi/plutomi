use axum::{extract::State, http::StatusCode, Json};
use mongodb::bson::doc;
use serde::Serialize;
use shared::{
    events::{OrderCreatedPayload, PlutomiEvent},
    get_env::get_env,
    mongodb::MongoDB,
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

    let event = PlutomiEvent::OrderCreated(OrderCreatedPayload {
        order_id: "12345".to_string(),
        customer_id: "67890".to_string(),
        total: 1000,
    });

    // Serialize the event to JSON
    let event_json = serde_json::to_string(&event).unwrap(); // TODO

    let produceResult = state
        .producer
        .send(
            rdkafka::producer::FutureRecord::to("test")
                .payload(&event_json)
                .key("key"),
            std::time::Duration::from_secs(0),
        )
        .await;

    match produceResult {
        Ok(_) => {
            println!("Message produced");
        }
        Err(e) => {
            eprintln!("Error producing message: {:?}", e);
        }
    }

    (StatusCode::OK, Json(response))
}
