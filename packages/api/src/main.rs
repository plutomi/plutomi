use crate::utils::get_env::get_env;
use axum::{
    body::Body,
    extract::{Request, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
    Router,
};
use time::OffsetDateTime;
use tokio::time::timeout;

use controllers::{create_totp, health_check, not_found};
use dotenv::dotenv;
use serde::Serialize;
use serde_json::{json, to_string, Value};
use std::{collections::HashMap, net::SocketAddr, sync::Arc};
use tower::ServiceBuilder;
use tower_http::{compression::CompressionLayer, timeout::TimeoutLayer};

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

#[derive(Serialize)]
enum PlutomiCode {
    TooManyUsers, //Sample
}
#[derive(Serialize)]
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
    fn into_response(self) -> Response {
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

/**
 * Collects info into a hashmap for easier logging
 */
fn collect_request_info(request: &Request) -> HashMap<String, Value> {
    let mut request_info = HashMap::<String, Value>::new();

    request_info.insert("method".to_string(), json!(request.method().as_str()));
    request_info.insert("uri".to_string(), json!(request.uri().to_string()));

    // Collect and serialize headers
    request_info.insert(
        "headers".to_string(),
        json!(collect_headers(request.headers())),
    );

    // Note: IP comes from the Cloudflare header if it exists

    request_info.insert(
        "headers".to_string(),
        json!(collect_headers(request.headers())),
    );
    request_info
}
/**
 * Collects info into a hashmap for easier logging
 */

fn collect_response_info(response: &Response) -> HashMap<String, Value> {
    let mut response_info = HashMap::<String, Value>::new();

    response_info.insert("status_code".to_string(), json!(response.status().as_u16()));

    // Collect and serialize headers
    response_info.insert(
        "headers".to_string(),
        json!(collect_headers(response.headers())),
    );

    response_info
}

/**
 * Collects headers into a hashmap for easier logging
 *
 */
fn collect_headers(headers: &HeaderMap) -> HashMap<String, String> {
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

async fn add_request_metadata(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Response {
    // Start a timer to see how long it takes us to process it
    let start_time = OffsetDateTime::now_utc();
    let formatted_start_time = iso_format(start_time);

    // On the way in, add some headers so we can search it in the logs
    request.headers_mut().insert(
        REQUEST_TIMESTAMP_HEADER,
        HeaderValue::from_str(&formatted_start_time).unwrap_or(UNKNOWN_HEADER),
    );

    let plutomi_id = PlutomiId::new(OffsetDateTime::now_utc(), Entities::Request);
    let request_id_value = HeaderValue::from_str(plutomi_id.as_str()).unwrap_or(UNKNOWN_HEADER);
    request
        .headers_mut()
        .insert(REQUEST_ID_HEADER, request_id_value.clone());

    // Parse the request
    let request_data: HashMap<String, Value> = collect_request_info(&request);

    state.logger.log(LogObject {
        // Log the request that came in
        level: LogLevel::Debug,
        error: None,
        message: "Request received".to_string(),
        data: None,
        timestamp: formatted_start_time,
        request: Some(json!(&request_data)),
        response: None,
    });

    // Call the next middleware and await the response
    let mut response = next.run(request).await;

    // Note how long the request took
    let end_time = OffsetDateTime::now_utc();
    let formatted_end_time = iso_format(end_time);
    let duration_ms = (end_time - start_time).whole_milliseconds();

    // On the way out, add some headers
    response.headers_mut().insert(
        RESPONSE_TIMESTAMP_HEADER,
        HeaderValue::from_str(&formatted_end_time).unwrap(),
    );

    response
        .headers_mut()
        .insert(REQUEST_ID_HEADER, request_id_value);
    // Log the raw response that went out
    let response_data: HashMap<String, Value> = collect_response_info(&response);

    state.logger.log(LogObject {
        level: LogLevel::Debug,
        error: None,
        message: "Response sent".to_string(),
        data: Some(json!({ "duration": duration_ms })), // ! TODO get the response body
        timestamp: formatted_end_time,
        request: Some(json!(request_data)),
        response: Some(json!(response_data)),
    });

    response
}

async fn timeout_middleware(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, (StatusCode, ApiError)> {
    let duration = std::time::Duration::from_secs(1);

    let request_data = collect_request_info(&request);
    match timeout(duration, next.run(request)).await {
        Ok(response) => Ok(response),
        Err(_) => {
            let error_message =
                "Your request took too long to process. Our developers have been notified."
                    .to_string();

            let status = StatusCode::REQUEST_TIMEOUT;
            let api_error = ApiError {
                message: error_message.clone(),
                plutomi_code: None,
                status_code: status.as_u16(),
                docs: None,
                request_id: request_data.get("headers").unwrap()[REQUEST_ID_HEADER]
                    .as_str()
                    .unwrap()
                    .to_string(),
            };

            // Log the error
            state.logger.log(LogObject {
                data: None,
                message: error_message.clone(),
                timestamp: iso_format(OffsetDateTime::now_utc()),
                level: LogLevel::Error,
                error: Some(json!(api_error)),
                request: Some(json!(request_data)),
                response: Some(json!(api_error)),
            });

            // Construct the final response
            return Err((status, api_error));
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
            .route("/health", get(health_check))
            .fallback(not_found)
            .layer(
                // Middleware is applied top to bottom as long as its attached to this ServiceBuilder
                ServiceBuilder::new()
                    .layer(middleware::from_fn_with_state(
                        state.clone(),
                        add_request_metadata,
                    ))
                    .layer(middleware::from_fn_with_state(
                        state.clone(),
                        timeout_middleware,
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
