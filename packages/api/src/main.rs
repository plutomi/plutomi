use crate::utils::get_env::get_env;
use axum::{
    body::{Body, Bytes},
    extract::{OriginalUri, Request, State},
    http::{header, request, response, HeaderMap, HeaderValue, Method, Response, StatusCode, Uri},
    middleware::{self, Next},
    response::IntoResponse,
    routing::{get, post},
    Extension, Json, Router,
};
use futures::TryFutureExt;
use http_body_util::BodyExt;
use time::{error::Parse, OffsetDateTime};
use tokio::time::timeout;

use controllers::{create_totp, health_check, not_found};
use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use serde_json::{from_slice, json, to_string, Value};
use std::{collections::HashMap, net::SocketAddr, sync::Arc, time::Duration};
use tower::ServiceBuilder;
use tower_http::{
    classify::ServerErrorsFailureClass, compression::CompressionLayer, timeout::TimeoutLayer,
    trace::TraceLayer,
};
use tracing::Span;

use utils::{
    generate_plutomiid::{Entities, PlutomiId},
    get_current_time::iso_format,
    get_env::Env,
    logger::{LogLevel, LogObject, Logger},
    mongodb::{connect_to_mongodb, MongoDB},
};
mod controllers;
mod entities;
mod utils;

const REQUEST_ID_HEADER: &str = "x-plutomi-request-id";
const REQUEST_TIMESTAMP_HEADER: &str = "x-plutomi-request-timestamp";
const RESPONSE_TIMESTAMP_HEADER: &str = "x-plutomi-response-timestamp";
const CLOUDFLARE_IP_HEADER: &str = "cf-connecting-ip";
const UNKNOWN_HEADER: HeaderValue = HeaderValue::from_static("unknown");

#[derive(Serialize, Clone, Deserialize)]
enum PlutomiCode {
    TooManyUsers, //Sample
}
#[derive(Serialize, Clone, Deserialize)]
struct ApiError {
    message: String,
    status_code: u16,
    request_id: String,
    docs: Option<String>,
    plutomi_code: Option<PlutomiCode>,
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
            "docs": self.docs.unwrap_or("https://plutomi.com/docs/api".to_string()),
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

struct ParsedRequest {
    // We need to recreate the request since we consume the body to extract it as bytes
    // The reason we do this is so that we can actually log it as a json serializable object
    original_request: Request,
    // For logging in middleware, we need the body as a json serializable object
    request_as_hashmap: HashMap<String, Value>,
}

// When logging, this helps format the JSON serialized req/res headers
fn headers_to_hashmap(headers: &HeaderMap) -> HashMap<String, String> {
    headers
        .iter()
        .map(|(key, value)| {
            (
                key.to_string(),
                value.to_str().unwrap_or("unknown").to_string(),
            )
        })
        .collect()
}

#[derive(Serialize, Debug)]
pub struct Error {
    pub response: String,
    pub text: String,
}

impl Error {
    pub fn new(text: &str) -> Self {
        Self {
            response: "ERROR".to_string(),
            text: text.to_string(),
        }
    }
}

pub async fn method_not_allowed(
    State(state): State<AppState>,
    Extension(request_as_hashmap): Extension<HashMap<String, Value>>,
    OriginalUri(uri): OriginalUri,
    method: Method,
    req: Request,
    next: Next,
) -> impl IntoResponse {
    // https://github.com/tokio-rs/axum/discussions/932
    // 405 fallback handler
    let original_response = next.run(req).await;
    let status = original_response.status();

    let message = format!("Method '{}' not allowed at route '{}'", method, uri.path());
    let api_error = ApiError {
        message: message.clone(),
        plutomi_code: None,
        status_code: status.as_u16(),
        docs: None,
        request_id: request_as_hashmap
            .get("headers")
            .and_then(|headers| headers.get(REQUEST_ID_HEADER))
            .and_then(|value| value.as_str())
            .unwrap_or("unknown")
            .to_string(),
    };
    match status {
        StatusCode::METHOD_NOT_ALLOWED => {
            state.logger.log(LogObject {
                level: LogLevel::Error,
                error: Some(json!(api_error.clone())),
                message,
                data: None,
                timestamp: iso_format(OffsetDateTime::now_utc()),
                request: Some(json!(request_as_hashmap)),
                response: None,
            });

            api_error.into_response()
        }

        _ => original_response,
    }
}

async fn parse_request(request: Request) -> Result<ParsedRequest, String> {
    // Split the request into parts
    let (parts, body) = request.into_parts();

    let mut request_as_hashmap = HashMap::<String, Value>::new();

    request_as_hashmap.insert("method".to_string(), json!(parts.method.to_string()));
    request_as_hashmap.insert("uri".to_string(), json!(parts.uri.to_string()));
    request_as_hashmap.insert(
        "headers".to_string(),
        json!(headers_to_hashmap(&parts.headers)),
    );

    // Only parse the body if the request method is POST or PUT
    let bytes = match parts.method {
        Method::POST | Method::PUT => {
            let bytes = body
                .collect()
                .await
                .map_err(|_e| "error parsing into bytes".to_string())?
                .to_bytes();

            request_as_hashmap.insert(
                "body".to_string(),
                json!(from_slice::<Value>(&bytes)
                    .map_err(|_e| { "error putting into hashmap".to_string() })?),
            );

            bytes
        }

        // Empty body for GET, DELETE, etc
        _ => Bytes::new(),
    };

    // Once you consume the body, you have to re-create the request
    let original_request = Request::from_parts(parts.clone(), Body::from(bytes.clone()));

    Ok(ParsedRequest {
        original_request,
        request_as_hashmap,
    })
}

struct ParsedResponse {
    original_response: Response<Body>,
    response_as_hashmap: HashMap<String, Value>,
}

async fn parse_response(response: Response<Body>) -> Result<ParsedResponse, String> {
    // Split the request into parts
    let (parts, body) = response.into_parts();

    // This wont work if the body is an long running stream
    let bytes = body
        .collect()
        .await
        .map_err(|_e| "Error parsing response body".to_string())?
        .to_bytes();

    // Once you consume the body, you have to re-create the request
    let original_response = Response::from_parts(parts.clone(), Body::from(bytes.clone()));

    let mut response_as_hashmap = HashMap::<String, Value>::new();

    response_as_hashmap.insert(
        "headers".to_string(),
        json!(headers_to_hashmap(&parts.headers)),
    );

    response_as_hashmap.insert("status_code".to_string(), json!(parts.status.as_u16()));
    response_as_hashmap.insert(
        "body".to_string(),
        json!(from_slice::<Value>(&bytes)
            .map_err(|_e| { "Error parsing response body".to_string() })?),
    );

    Ok(ParsedResponse {
        original_response,
        response_as_hashmap,
    })
}

async fn log_req_res(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Response<Body> {
    // Start a timer to see how long it takes us to process it
    let start_time = OffsetDateTime::now_utc();
    let formatted_start_time = iso_format(start_time);
    // Add a timestamp header
    request.headers_mut().insert(
        REQUEST_TIMESTAMP_HEADER,
        HeaderValue::from_str(&formatted_start_time).unwrap_or(UNKNOWN_HEADER),
    );

    // Add a request ID based on a PlutomiID
    let request_id = PlutomiId::new(OffsetDateTime::now_utc(), Entities::Request);
    let request_id_value = HeaderValue::from_str(&request_id).unwrap_or(UNKNOWN_HEADER);
    request
        .headers_mut()
        .insert(REQUEST_ID_HEADER, request_id_value.clone());

    // Attempt to parse the request
    let all_request_data = parse_request(request).await;

    match all_request_data {
        Err(message) => {
            // If the REQUEST failed to parse, log it and return a 400
            let end_time = OffsetDateTime::now_utc();
            let formatted_end_time = iso_format(start_time);
            let duration_ms: i128 = (end_time - start_time).whole_milliseconds();

            let status = StatusCode::BAD_REQUEST;
            let api_error = ApiError {
                message: message.clone(),
                plutomi_code: None,
                status_code: status.as_u16(),
                docs: None,
                request_id,
            };

            let response = api_error.clone().into_response();

            let mut parsed_response = parse_response(response).await.unwrap();

            parsed_response.original_response.headers_mut().insert(
                RESPONSE_TIMESTAMP_HEADER,
                HeaderValue::from_str(&formatted_end_time).unwrap(),
            );

            // Log the error
            state.logger.log(LogObject {
                data: Some(json!({ "duration": duration_ms })),
                message,
                timestamp: iso_format(OffsetDateTime::now_utc()),
                level: LogLevel::Error,
                error: Some(json!(api_error)),
                request: None,
                response: Some(json!(parsed_response.response_as_hashmap)),
            });

            parsed_response.original_response
        }
        Ok(mut request_data) => {
            // Log the incoming parsed request - everything is valid form here on out
            state.logger.log(LogObject {
                level: LogLevel::Debug,
                error: None,
                message: "Request received".to_string(),
                data: None,
                timestamp: formatted_start_time,
                request: Some(json!(request_data.request_as_hashmap)),
                response: None,
            });

            request_data
                .original_request
                .extensions_mut()
                .insert(request_data.request_as_hashmap.clone());

            // Call the next middleware and await the response
            let mut response = next.run(request_data.original_request).await;

            // Note how long the request took
            let end_time = OffsetDateTime::now_utc();
            let formatted_end_time = iso_format(end_time);
            let duration_ms: i128 = (end_time - start_time).whole_milliseconds();

            // On the way out, add some headers
            response.headers_mut().insert(
                RESPONSE_TIMESTAMP_HEADER,
                HeaderValue::from_str(&formatted_end_time).unwrap(),
            );

            response
                .headers_mut()
                .insert(REQUEST_ID_HEADER, request_id_value);

            // Log the raw response that is going out
            // Since we are responding, we can be sure the response is serializable
            let parsed_response = parse_response(response).await.unwrap();

            state.logger.log(LogObject {
                level: match parsed_response.original_response.status().as_u16() {
                    400..=599 => LogLevel::Error,
                    _ => LogLevel::Debug,
                },
                error: None,
                message: "Response sent".to_string(),
                data: Some(json!({ "duration": duration_ms })),
                timestamp: formatted_end_time,
                request: Some(json!(&request_data.request_as_hashmap)),
                response: Some(json!(parsed_response.response_as_hashmap)),
            });

            parsed_response.original_response
        }
    }
}

#[derive(Clone)]
pub struct AppState {
    logger: Arc<Logger>,
    mongodb: Arc<MongoDB>,
    env: Env,
}

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    // Get environment variables
    dotenv().ok(); // Load .env if available (used in development)
    let env = get_env();

    let is_production =
        env.NEXT_PUBLIC_ENVIRONMENT == "production" || env.NEXT_PUBLIC_ENVIRONMENT == "staging";
    // Setup logging
    let logger = Logger::new(true); // TODO swap this for is_production

    // Connect to database
    let mongodb = connect_to_mongodb().await;

    // Create an instance of AppState to be shared with all routes
    let state = AppState {
        logger: logger.clone(),
        mongodb,
        env,
    };

    // Routes
    let totp_routes = Router::new().route("/totp", post(create_totp));

    let app = Router::new().nest(
        "/api",
        Router::new()
            .merge(totp_routes)
            .route("/health", post(health_check))
            .fallback(not_found)
            .layer(
                // Middleware is applied top to bottom as long as its attached to this ServiceBuilder
                ServiceBuilder::new()
                    .layer(middleware::from_fn_with_state(state.clone(), log_req_res))
                    .layer(middleware::from_fn_with_state(
                        state.clone(),
                        method_not_allowed,
                    )),
            )
            .with_state(state),
    );

    let port = "[::]:8080";
    // Bind address
    let addr = port.parse::<std::net::SocketAddr>().unwrap_or_else(|e| {
        let message = format!("Failed to parse address on startup '{}': {}", port, e);
        let error_json = json!({ "message": &message });
        logger.log(LogObject {
            level: LogLevel::Error,
            timestamp: iso_format(OffsetDateTime::now_utc()),
            message,
            data: Some(json!({ "port": port })),
            error: Some(error_json),
            request: None,
            response: None,
        });
        std::process::exit(1);
    });

    // Bind listener
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .unwrap_or_else(|e| {
            let message = format!("Failed to bind to address on startup '{}': {}", addr, e);
            let error_json = json!({ "message": &message });
            logger.log(LogObject {
                level: LogLevel::Error,
                timestamp: iso_format(OffsetDateTime::now_utc()),
                message,
                data: Some(json!({ "addr": addr })),
                error: Some(error_json),
                request: None,
                response: None,
            });
            std::process::exit(1);
        });

    // Start the server
    axum::serve(listener, app)
        .await
        .map(|_| {
            logger.log(LogObject {
                level: LogLevel::Info,
                timestamp: iso_format(OffsetDateTime::now_utc()),
                message: "Server started".to_string(),
                data: None,
                error: None,
                request: None,
                response: None,
            })
        })
        .unwrap_or_else(|e| {
            let logger = logger.clone();
            let message = format!("Server failed to start: {}", e);
            let error_json = json!({ "message": &message });
            logger.log(LogObject {
                level: LogLevel::Error,
                timestamp: iso_format(OffsetDateTime::now_utc()),
                message,
                data: None,
                error: Some(error_json),
                request: None,
                response: None,
            });
            std::process::exit(1);
        })
}
