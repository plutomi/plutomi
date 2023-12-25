use crate::utils::get_env::get_env;
use axum::{
    body::{Body, Bytes},
    extract::{Request, State},
    http::{header, response, HeaderMap, HeaderValue, Method, StatusCode, Uri},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
    Router,
};
use futures::TryFutureExt;
use http_body_util::BodyExt;
use time::{error::Parse, OffsetDateTime};
use tokio::time::timeout;

use controllers::{create_totp, health_check, not_found};
use dotenv::dotenv;
use serde::Serialize;
use serde_json::{json, to_string, Value};
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
const ERROR_PARSING_BODY: &str = "Failed to parse request body";

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
 * Parse the request body. Return it as well as the request again. Axum allows you to consume the body once so you have to re-create it
 */

struct ParsedRequest {
    request: Request<Body>,
    body_bytes: Bytes,
    method: Method,
    uri: Uri,
    headers: HeaderMap,
}

async fn parse_request(request: Request) -> Result<ParsedRequest, String> {
    let (parts, body) = request.into_parts();

    // this wont work if the body is an long running stream
    let collected_bytes = body.collect().await;

    match collected_bytes {
        Ok(bytes) => {
            let bytes = bytes.to_bytes();
            let recreated_request = Request::from_parts(parts.clone(), Body::from(bytes.clone()));

            Ok(ParsedRequest {
                request: recreated_request,
                body_bytes: bytes,
                method: parts.method,
                uri: parts.uri,
                headers: parts.headers,
            })
        }
        Err(_) => Err("Failed to parse request body".to_string()),
    }
}

struct ParsedResponse {
    response: Response<Body>,
    body_bytes: Bytes,
    headers: HeaderMap,
}

async fn parse_response(response: Response) -> Result<ParsedResponse, String> {
    let (parts, body) = response.into_parts();

    // this wont work if the body is an long running stream
    let collected_bytes = body.collect().await;

    match collected_bytes {
        Ok(bytes) => {
            let bytes = bytes.to_bytes();
            let recreated_response = Response::from_parts(parts.clone(), Body::from(bytes.clone()));

            Ok(ParsedResponse {
                response: recreated_response,
                body_bytes: bytes,
                headers: parts.headers,
            })
        }
        Err(_) => Err("Failed to parse request body".to_string()),
    }
}

/**
 * Collects info into a hashmap for easier logging
 */
async fn request_to_hashmap(request: &ParsedRequest) -> Result<HashMap<String, Value>, String> {
    let mut request_info = HashMap::<String, Value>::new();

    request_info.insert("method".to_string(), json!(request.method.to_string()));
    request_info.insert("uri".to_string(), json!(request.uri.to_string()));

    // Collect and serialize headers
    request_info.insert(
        "headers".to_string(),
        json!(collect_headers(&request.headers)),
    );

    // Note: IP comes from the Cloudflare header if it exists
    let body_to_json = serde_json::from_slice::<Value>(&request.body_bytes);

    match body_to_json {
        Ok(body) => {
            request_info.insert("body".to_string(), body);
            Ok(request_info)
        }
        Err(_) => Err(ERROR_PARSING_BODY.to_string()),
    }
}

/**
 * Collects info into a hashmap for easier logging
 */
async fn response_to_hashmap(response: &ParsedResponse) -> Result<HashMap<String, Value>, String> {
    let mut response_info = HashMap::<String, Value>::new();

    // Collect and serialize headers
    response_info.insert(
        "headers".to_string(),
        json!(collect_headers(&response.headers)),
    );

    let body_to_json = serde_json::from_slice::<Value>(&response.body_bytes);

    match body_to_json {
        Ok(body) => {
            response_info.insert("body".to_string(), body);
            Ok(response_info)
        }
        Err(_) => Err(ERROR_PARSING_BODY.to_string()),
    }
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

async fn log_res_res(State(state): State<AppState>, mut request: Request, next: Next) -> Response {
    // Start a timer to see how long it takes us to process it
    let start_time = OffsetDateTime::now_utc();
    let formatted_start_time = iso_format(start_time);

    // Add a request ID based on a PlutomiID
    let request_id = PlutomiId::new(OffsetDateTime::now_utc(), Entities::Request);
    let request_id_value = HeaderValue::from_str(&request_id).unwrap_or(UNKNOWN_HEADER);
    // Add a timestamp header
    request.headers_mut().insert(
        REQUEST_TIMESTAMP_HEADER,
        HeaderValue::from_str(&formatted_start_time).unwrap_or(UNKNOWN_HEADER),
    );

    // Add a request ID based on a PlutomiID
    request
        .headers_mut()
        .insert(REQUEST_ID_HEADER, request_id_value.clone());

    // Parse the request
    let request_data = parse_request(request).await;

    match request_data {
        Err(message) => {
            // If the request failed to parse, log it and return a 400

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

            // Log the error
            state.logger.log(LogObject {
                data: Some(json!({ "duration": duration_ms })),
                message,
                timestamp: iso_format(OffsetDateTime::now_utc()),
                level: LogLevel::Error,
                error: Some(json!(api_error)),
                request: None,
                response: None,
            });

            let mut response = api_error.into_response();

            response.headers_mut().insert(
                RESPONSE_TIMESTAMP_HEADER,
                HeaderValue::from_str(&formatted_end_time).unwrap(),
            );

            response
        }

        Ok(req_data) => {
            // Attempt to convert the request to a serializable hashmap
            let req_as_hashmap = request_to_hashmap(&req_data).await;

            match req_as_hashmap {
                Err(message) => {
                    // If the request failed to parse into serializable JSON, log it and return a 400
                    let end_time = OffsetDateTime::now_utc();
                    let formatted_end_time = iso_format(start_time);
                    let duration_ms: i128 = (end_time - start_time).whole_milliseconds();

                    let status = StatusCode::BAD_REQUEST;
                    let api_error = ApiError {
                        message: message.clone(),
                        plutomi_code: None,
                        status_code: status.as_u16(),
                        docs: None,
                        request_id: request_id_value.to_str().unwrap().to_string(),
                    };

                    // Log the error
                    state.logger.log(LogObject {
                        data: Some(json!({ "duration": duration_ms})),
                        message,
                        timestamp: iso_format(OffsetDateTime::now_utc()),
                        level: LogLevel::Error,
                        error: Some(json!(api_error)),
                        request: None,
                        response: None,
                    });

                    let mut response = api_error.into_response();

                    response.headers_mut().insert(
                        RESPONSE_TIMESTAMP_HEADER,
                        HeaderValue::from_str(&formatted_end_time).unwrap(),
                    );

                    response
                }
                Ok(req_as_hashmap) => {
                    // Log the incoming request - everything is valid form here on out
                    state.logger.log(LogObject {
                        level: LogLevel::Debug,
                        error: None,
                        message: "Request received".to_string(),
                        data: None,
                        timestamp: formatted_start_time,
                        request: Some(json!(req_as_hashmap)),
                        response: None,
                    });

                    // Call the next middleware and await the response
                    let mut response = next.run(req_data.request).await;

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


                        return response
                    // Log the raw response that is going out
                    // Since we are responding, we can be sure the response is serializable
                    let parsed_response = parse_response(response).await.unwrap();
                    let log_able_response: HashMap<String, Value> =
                        response_to_hashmap(&parsed_response).await.unwrap();

                    state.logger.log(LogObject {
                        level: LogLevel::Debug,
                        error: None,
                        message: "Response sent".to_string(),
                        data: Some(json!({ "duration": duration_ms })),
                        timestamp: formatted_end_time,
                        request: Some(json!(req_as_hashmap)),
                        response: Some(json!(log_able_response)),
                    });

                    parsed_response.response
                }
            }
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
                    .layer(middleware::from_fn_with_state(state.clone(), log_res_res)),
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
