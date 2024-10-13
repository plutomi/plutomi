use axum::{response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use crate::structs::app_state::AppState;

#[derive(Deserialize, Serialize, Debug)]
struct NewUser {
    first_name: String,
    last_name: String,
    email: String,
}

pub async fn post_users(state: AppState, Json(user): Json<NewUser>) -> impl IntoResponse {

    // TODO: Implement the post_users controller

    // Return an HTTP 200 response with a JSON body containing the user's ID
    // and email address
}
