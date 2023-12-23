use crate::utils::get_env::get_env;
use axum::{
    error_handling::HandleErrorLayer,
    extract::Request,
    http::{HeaderValue, Method, StatusCode, Uri},
    middleware::Next,
    response::{IntoResponse, Response},
    routing::{get, post},
    BoxError, Router,
};
use controllers::{create_totp, health_check, not_found};
use dotenv::dotenv;
use serde::Serialize;
use serde_json::{json, Value};
use std::{collections::HashMap, sync::Arc, time::Duration};
use tower::ServiceBuilder;
use tower_http::timeout::TimeoutLayer;
use utils::{logger::Logger, mongodb::connect_to_mongodb};
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
async fn add_custom_id(mut request: Request, next: Next) -> Response {
    request.headers_mut().insert(
        "x-custom-request-id",
        HeaderValue::from_static("your_custom_id"), // Replace with your custom value
    );

    let response = next.run(request).await;

    return response;
}

fn handle_timeout_error(_method: Method, _uri: Uri, err: BoxError) -> impl IntoResponse {
    if err.is::<tower::timeout::error::Elapsed>() {
        (
            StatusCode::REQUEST_TIMEOUT,
            "Request took too long".to_string(),
        )
    } else {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Unhandled internal error: {}", err),
        )
    }
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
                    .layer(HandleErrorLayer::new(handle_timeout_error))
                    .layer(TimeoutLayer::new(Duration::from_secs(10))), //  // Layers run from top to bottom - do not remove ServiceBuilder
                                                                        // .layer(middleware::from_fn(add_custom_id))
                                                                        // .layer(
                                                                        //     TraceLayer::new_for_http()
                                                                        //         .on_request({
                                                                        //             let logger: Arc<Logger> = logger.clone(); //
                                                                        //             move |request: &Request<_>, _span: &Span| {
                                                                        //                 // ! TODO: Parse body!!

                                                                        //                 let logger = logger.clone(); // Clone the Arc for use within this closure
                                                                        //                 let properties: HashMap<String, StringOrJson> =
                                                                        //                     parse_request(request);
                                                                        //                 let parst = request.extract_parts();

                                                                        //                 tokio::spawn(async move {
                                                                        //                     logger.debug(
                                                                        //                         // ! TODO: Add timestamp from headers, format it!
                                                                        //                         "Request received".to_string(),
                                                                        //                         Some(json!(properties)),
                                                                        //                     )
                                                                        //                 });
                                                                        //             }
                                                                        //         })
                                                                        //         .on_response({
                                                                        //             // ! TODO: Log response values
                                                                        //             let logger: Arc<Logger> = logger.clone();

                                                                        //             move |_response: &Response<_>, _latency: Duration, _span: &Span| {
                                                                        //                 tokio::spawn(async move {
                                                                        //                     let logger = logger.clone();
                                                                        //                     logger.debug(
                                                                        //                         "Response sent".to_string(),
                                                                        //                         // TODO send response
                                                                        //                         Some(json!({"todo": "todo"})),
                                                                        //                     );
                                                                        //                 });
                                                                        //             }
                                                                        //         })
                                                                        //         .on_failure({
                                                                        //             let logger: Arc<Logger> = logger.clone();

                                                                        //             move |error: ServerErrorsFailureClass,
                                                                        //                   _latency: Duration,
                                                                        //                   _span: &Span| {
                                                                        //                 let logger = logger.clone();
                                                                        //                 tokio::spawn(async move {
                                                                        //                     let error_message = format!("Request failed: {:?}", error);
                                                                        //                     logger.error(
                                                                        //                         error_message,
                                                                        //                         None,
                                                                        //                         Some(json!({ "error": error.to_string() })),
                                                                        //                     );
                                                                        //                 });
                                                                        //             }
                                                                        //         }),
                                                                        // )
                                                                        // .layer(CompressionLayer::new())
                                                                        // .layer(Extension(logger.clone()))
                                                                        // .layer(Extension(mongodb)),
            ),
    );

    // Bind address
    let addr = match "[::]:8080".parse::<std::net::SocketAddr>() {
        Ok(addr) => addr,
        Err(e) => {
            let logger: Arc<Logger> = logger.clone();
            logger.error(
                format!("Error parsing address: {}", e),
                None,
                Some(json!({ "error": e.to_string() })),
            );
            std::process::exit(1);
        }
    };

    // Bind listener
    let listener = match tokio::net::TcpListener::bind(&addr).await {
        Ok(listener) => listener,
        Err(e) => {
            let logger: Arc<Logger> = logger.clone();
            logger.error(
                format!("Error binding address: {}", e),
                None,
                Some(json!({ "error": e.to_string()})),
            );
            std::process::exit(1);
        }
    };

    // Start the server
    match axum::serve(listener, app).await {
        Ok(_) => {
            let logger: Arc<Logger> = logger.clone();
            logger.debug("Server started".to_string(), None);
        }
        Err(e) => {
            let logger: Arc<Logger> = logger.clone();
            logger.error(
                format!("Error starting server: {}", e),
                None,
                Some(json!({ "error": e.to_string()})),
            );
            std::process::exit(1);
        }
    }
}
