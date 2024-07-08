use crate::utils::mongodb::MongoDB;
use axum::{http::StatusCode, Extension, Json};
use serde::Serialize;
use shared::get_env::get_env;
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
        database: mongodb.collection.find_one(None, None).await.is_ok(),
        environment: get_env().ENVIRONMENT,
    };
    (StatusCode::OK, Json(response))
}

fn print_name(name_input: &String) {
    println!("{}", name_input);
    // Delete the input string
    drop(name_input);
}

fn main() {
    let name = String::from("Alice");
    print_name(&name);
    print_name(&name);
}
