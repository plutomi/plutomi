use axiom_rs::datasets::Stat;
use axum::{
    body::Body,
    http::{header, status, Response, StatusCode},
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use shared::get_env::get_env;

// Internal error codes
#[derive(Serialize, Clone, Deserialize)]
pub enum PlutomiCode {
    TooManyUsers,
    InvalidToken,
}

#[derive(Serialize, Clone)]
pub struct ApiResponse {
    pub message: Option<String>,
    pub status_code: u16,
    pub request_id: String,
    pub data: Value,
    pub docs_url: Option<String>,
    pub plutomi_code: Option<PlutomiCode>,
}

impl ApiResponse {
    pub fn success(data: Value, request_id: String, status_code: StatusCode) -> Self {
        ApiResponse {
            message: None,
            status_code: status_code.as_u16(),
            request_id,
            data,
            docs_url: None,
            plutomi_code: None,
        }
    }

    pub fn error(
        message: String,
        status_code: StatusCode,
        request_id: String,
        docs_url: Option<String>,
        plutomi_code: Option<PlutomiCode>,
        data: Value,
    ) -> Self {
        ApiResponse {
            message: Some(message.clone()),
            status_code: status_code.as_u16(),
            request_id,
            docs_url,
            data,
            plutomi_code,
        }
    }
}

impl IntoResponse for ApiResponse {
    fn into_response(self) -> Response<Body> {
        // If error is present, serialize error; otherwise, serialize data
        let body = match serde_json::to_string(&self.data) {
            Ok(json_string) => Body::from(json_string),
            Err(_) => Body::empty(),
        };

        Response::builder()
            .status(self.status_code)
            .header("x-plutomi-request-id", self.request_id)
            .header(header::CONTENT_TYPE, "application/json")
            .body(body)
            // Safe unwrap if status code and headers  are valid
            .unwrap()
    }
}
