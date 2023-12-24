use crate::utils::get_env::get_env;
use axum::{
    body::Body,
    error_handling::HandleErrorLayer,
    extract::{Request, State},
    http::{header, HeaderValue, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
    BoxError, Json, Router,
};
use tokio::time::{error::Elapsed, timeout};

use controllers::{create_totp, health_check, not_found};
use dotenv::dotenv;
use serde::Serialize;
use serde_json::{json, Value};
use std::{collections::HashMap, sync::Arc, time::Duration};
use tower::ServiceBuilder;
use tower_http::{compression::CompressionLayer, timeout::TimeoutLayer};

use utils::{
    get_current_time::get_current_time,
    get_env::Env,
    logger::{LogLevel, LogObject, Logger},
    mongodb::{connect_to_mongodb, MongoDB},
};
mod controllers;
mod entities;
mod utils;

#[derive(Serialize)]
enum PlutomiCode {
    TooManyUsers, // TODO custom error codes for business logic
}
struct ApiError {
    message: String,
    code: StatusCode,
    request_id: String,
    docs: Option<String>,
    plutomi_code: Option<PlutomiCode>,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        // Serialize your JSON value into a String
        let json_string = json!({
            "message": self.message,
            "code": self.code.canonical_reason().unwrap_or("UNKNOWN"),
            "status_code": self.code.as_u16(),
            "plutomi_code": self.plutomi_code,
            "docs": self.docs.unwrap_or("https://plutomi.com/docs/api".to_string()),
            "request_id": self.request_id
        })
        .to_string();

        // Convert the String into a Body
        let body = Body::from(json_string);

        // Build the response
        Response::builder()
            .status(self.code)
            .header(header::CONTENT_TYPE, "application/json")
            .body(body)
            .unwrap() // This unwrap is safe as long as the header and status code are valid
    }
}

fn collect_headers<B>(request: &Request<B>) -> Value {
    let headers = request
        .headers()
        .iter()
        .map(|(key, value)| {
            (
                key.to_string(),
                value.to_str().unwrap_or_default().to_string(),
            )
        })
        .collect::<HashMap<String, String>>();

    json!(headers)
}

fn collect_res_headers<B>(response: &Response<B>) -> Value {
    let headers = response
        .headers()
        .iter()
        .map(|(key, value)| {
            (
                key.to_string(),
                value.to_str().unwrap_or_default().to_string(),
            )
        })
        .collect::<HashMap<String, String>>();

    json!(headers)
}

async fn add_request_metadata(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Response {
    let current_time = get_current_time();
    request.headers_mut().insert(
        "x-plutomi-request-timestamp",
        HeaderValue::from_str(&current_time).unwrap(),
    );

    request.headers_mut().insert(
        "x-plutomi-request-id",
        // TODO ksuid
        HeaderValue::from_static("your_custom_id"), // Replace with your custom value
    );

    state.logger.log(LogObject {
        level: LogLevel::Debug,
        error: None,
        message: "Request received".to_string(),
        data: Some(json!({"test": "easy"})),
        timestamp: current_time,
        request: Some(json!(parse_request(&request))),
    });

    next.run(request).await
}

async fn add_response_metadata(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Response {
    let mut response = next.run(request).await;
    response.headers_mut().insert(
        "x-plutomi-response-timestamp",
        HeaderValue::from_str(&get_current_time()).unwrap(),
    );

    state.logger.log(LogObject {
        level: LogLevel::Debug,
        error: None,
        message: "Response sent".to_string(),
        data: Some(json!({"resp": "resp", "status": response.status().as_u16()})),
        timestamp: get_current_time(),
        request: None,
        // response: Some(json!(parse_response(&response))),
    });

    response
}

#[derive(Serialize)]
#[serde(untagged)]
enum StringOrJson {
    Str(String),
    Json(Value),
}

fn parse_request<B>(request: &Request<B>) -> HashMap<String, StringOrJson> {
    let mut request_map = HashMap::new();

    request_map.insert(
        "method".to_string(),
        StringOrJson::Str(request.method().to_string()),
    );
    request_map.insert(
        "uri".to_string(),
        StringOrJson::Str(request.uri().to_string()),
    );
    request_map.insert(
        "headers".to_string(),
        StringOrJson::Json(collect_headers(request)),
    );

    return request_map;
}

fn parse_response<B>(response: &Response<B>) -> HashMap<String, StringOrJson> {
    let mut response_map = HashMap::new();

    // response_map.insert(
    //     "uri".to_string(),
    //     StringOrJson::Str(response.body()),
    // );
    response_map.insert(
        "headers".to_string(),
        StringOrJson::Json(collect_res_headers(response)),
    );

    return response_map;
}

async fn timeout_middleware(
    State(state): State<AppState>,
    req: Request,
    next: Next,
) -> Result<Response, (StatusCode, ApiError)> {
    let duration = Duration::from_secs(1);

    match timeout(duration, next.run(req)).await {
        Ok(response) => Ok(response),
        Err(_) => {
            let error_message =
                "Your request took too long to process. Our developers have been notified."
                    .to_string();
            // Log the error
            state.logger.log(LogObject {
                request: None,
                data: None,
                message: error_message.clone(),
                timestamp: get_current_time(),
                level: LogLevel::Error,
                error: Some(json!({
                    "message": error_message,
                    "code": StatusCode::REQUEST_TIMEOUT.as_u16(),
                })),
            });

            Err((
                StatusCode::REQUEST_TIMEOUT,
                ApiError {
                    message: error_message,
                    plutomi_code: None,
                    code: StatusCode::REQUEST_TIMEOUT,
                    docs: None,
                    request_id: "TBD".to_string(),
                },
            ))
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
    // Load .env if available (used in development)
    dotenv().ok();

    let env = get_env();

    // Setup logging
    let logger = Logger::new(true);

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
                ServiceBuilder::new()
                    .layer(middleware::from_fn_with_state(
                        state.clone(),
                        add_request_metadata,
                    ))
                    .layer(middleware::from_fn_with_state(
                        state.clone(),
                        timeout_middleware,
                    ))
                    .layer(middleware::from_fn_with_state(
                        state.clone(),
                        add_response_metadata,
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
            timestamp: get_current_time(),
            message,
            data: Some(json!({ "port": port })),
            error: Some(error_json),
            request: None,
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
                timestamp: get_current_time(),
                message,
                data: Some(json!({ "addr": addr })),
                error: Some(error_json),
                request: None,
            });
            std::process::exit(1);
        });

    // Start the server
    axum::serve(listener, app)
        .await
        .map(|_| {
            logger.log(LogObject {
                level: LogLevel::Info,
                timestamp: get_current_time(),
                message: "Server started".to_string(),
                data: None,
                error: None,
                request: None,
            })
        })
        .unwrap_or_else(|e| {
            let logger = logger.clone();
            let message = format!("Server failed to start: {}", e);
            let error_json = json!({ "message": &message });
            logger.log(LogObject {
                level: LogLevel::Error,
                timestamp: get_current_time(),
                message,
                data: None,
                error: Some(error_json),
                request: None,
            });
            std::process::exit(1);
        })
}
