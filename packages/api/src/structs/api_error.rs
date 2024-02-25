use axum::{
    body::Body,
    http::{header, Response, StatusCode},
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize, Clone, Deserialize)]
pub enum PlutomiCode {
    TooManyUsers, //Sample
}

#[derive(Serialize, Clone, Deserialize)]
pub struct ApiError {
    pub message: String,
    pub status_code: u16,
    pub request_id: String,
    pub docs: Option<String>,
    pub plutomi_code: Option<PlutomiCode>,
}

impl IntoResponse for ApiError {
    /**
     * This is called when you return ApiError from a route
     * It will convert your ApiError into a Response
     */
    fn into_response(self) -> Response<Body> {
        // Serialize your JSON value into a String
        let json_string = json!({
            "message": self.message,
            "code": StatusCode::from_u16(self.status_code).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR).canonical_reason().unwrap_or("unknown"),
            "status_code": self.status_code,
            "plutomi_code": self.plutomi_code, // null if not set
            "docs": self.docs.unwrap_or("https://plutomi.com/docs/api".to_string()), // TODO: Use env BASE_WEB_URL
            "request_id": self.request_id
        })
        .to_string();

        // Convert the String into a Body
        let body = Body::from(json_string);

        // Build the response
        Response::builder()
            .status(self.status_code)
            .header(header::CONTENT_TYPE, "application/json")
            .body(body)
            .unwrap() // This unwrap is safe as long as the header and status code are valid
    }
}
