use crate::utils::get_env::get_env;
use axum::{
    error_handling::HandleErrorLayer,
    extract::{Request, State},
    http::{HeaderValue, Method, StatusCode, Uri},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
    BoxError, Extension, RequestExt, Router,
};
use controllers::{create_totp, health_check, not_found};
use dotenv::dotenv;
use serde::Serialize;
use serde_json::{json, Value};
use std::{collections::HashMap, sync::Arc, time::Duration};
use tower::ServiceBuilder;
use tower_http::{
    classify::ServerErrorsFailureClass, compression::CompressionLayer, timeout::TimeoutLayer,
    trace::TraceLayer,
};
use tracing::Span;
use utils::{
    get_current_time::get_current_time,
    logger::{self, LogLevel, LogObject, Logger},
    mongodb::{connect_to_mongodb, MongoDB},
};
mod controllers;
mod entities;
mod utils;

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

/**
 * Wrapper for the logger in Axum requests
 */
fn req_logger(request: &Request, log: LogObject) {
    request
        .extensions()
        .get::<Arc<Logger>>()
        .map(|logger| logger.log(log))
        .unwrap_or_else(|| tracing::warn!("Logger not found in request extensions"));
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

async fn add_response_timestamp(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;
    response.headers_mut().insert(
        "x-plutomi-response-timestamp",
        HeaderValue::from_str(&get_current_time()).unwrap(),
    );
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

async fn handle_timeout_error(err: BoxError) -> (StatusCode, String) {
    // TODO add logging
    if err.is::<tower::timeout::error::Elapsed>() {
        (StatusCode::REQUEST_TIMEOUT, "Request timed out".to_string())
    } else {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Unhandled internal error: {err}"),
        )
    }
}

#[derive(Clone)]
pub struct AppState {
    logger: Arc<Logger>,
    mongodb: Arc<MongoDB>,
}

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    // Load .env if available (used in development)
    dotenv().ok();
    let env_vars = get_env();
    let is_production =
        ["production", "staging"].contains(&env_vars.NEXT_PUBLIC_ENVIRONMENT.as_str());

    // Setup logging
    let logger = Logger::new(true);

    // Connect to database
    let mongodb = connect_to_mongodb().await;

    // Create an instance of AppState
    let state = AppState { logger, mongodb };

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
                    .layer(HandleErrorLayer::new(handle_timeout_error))
                    .timeout(Duration::from_secs(1))
                    .layer(CompressionLayer::new())
                    .layer(middleware::from_fn(add_response_timestamp)),
            )
            .with_state(state),
    );

    // Bind address
    let addr = match "[::]:8080".parse::<std::net::SocketAddr>() {
        Ok(addr) => addr,
        Err(e) => {
            // ! TODO logging
            std::process::exit(1);
        }
    };

    // Bind listener
    let listener = match tokio::net::TcpListener::bind(&addr).await {
        Ok(listener) => listener,
        Err(e) => {
            // ! TODO logging
            std::process::exit(1);
        }
    };

    // Start the server
    match axum::serve(listener, app).await {
        Ok(_) => {
            // ! TODO Logging
        }
        Err(e) => {
            // ! TODO logging
            std::process::exit(1);
        }
    }
}
