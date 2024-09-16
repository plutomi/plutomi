use axum::{
    body::Body,
    http::{header, Response, StatusCode},
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use shared::get_env::get_env;

#[derive(Serialize, Clone, Deserialize)]
pub enum PlutomiCode {
    TooManyUsers, //Sample
}

// impl IntoResponse for ApiError {
//     /**
//      * This is called when you return ApiError from a route
//      * It will convert your ApiError into a Response
//      */
//     fn into_response(self) -> Response<Body> {
//         // Serialize your JSON value into a String
//         let body = Body::from(json!({
//             "message": self.message,
//             "code": StatusCode::from_u16(self.status_code).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR).canonical_reason().unwrap_or("unknown"),
//             "status_code": self.status_code,
//             "plutomi_code": self.plutomi_code, // null if not set
//             "docs_url": self.docs_url.unwrap_or(format!("{}/docs/api", &get_env().BASE_WEB_URL).to_string()),
//         })
//         .to_string());

//         // Build the response
//         Response::builder()
//             .status(self.status_code)
//             .header(header::CONTENT_TYPE, "application/json")
//             .header("x-plutomi-request-id", self.request_id)
//             .body(body)
//             .unwrap_or_else(|e| {
//                 // If we can't build the response, log the error and return a 500
//                 eprintln!("Failed to build response: {}", e);
//                 Response::builder()
//                     .status(StatusCode::INTERNAL_SERVER_ERROR)
//                     .body(Body::from("Internal Server Error"))
//                     .unwrap()
//             })
//     }
// }

#[derive(Serialize, Clone)]
pub struct ApiResponse {
    pub message: Option<String>,
    pub status_code: u16,
    pub request_id: String,
    pub data: Value,
    pub docs_url: Option<String>,
    pub plutomi_code: Option<PlutomiCode>,
}

#[derive(Serialize, Clone)]
pub struct ApiError {
    pub message: String,
    pub docs_url: Option<String>,
    pub plutomi_code: Option<PlutomiCode>,
}

impl ApiResponse {
    pub fn success(data: Value, request_id: String) -> Self {
        ApiResponse {
            message: None,
            status_code: 200,
            request_id,
            data,
            docs_url: None,
            plutomi_code: None,
        }
    }

    pub fn error(
        message: String,
        status_code: u16,
        request_id: String,
        docs_url: Option<String>,
        plutomi_code: Option<PlutomiCode>,
        data: Value,
    ) -> Self {
        ApiResponse {
            message: Some(message.clone()),
            status_code,
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
            .unwrap() // Safe unwrap
    }
}
