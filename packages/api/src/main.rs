use axum::{
    http::{Request, Response},
    routing::{get, post},
    Extension, Router,
};
use controllers::{create_totp, health_check, not_found};
use dotenv::dotenv;
use serde_json::json;
use std::{collections::HashMap, sync::Arc, time::Duration};
use tower::ServiceBuilder;
use tower_http::{
    classify::ServerErrorsFailureClass, compression::CompressionLayer, timeout::TimeoutLayer,
    trace::TraceLayer,
};
use tracing::Span;
use utils::{logger::Logger, mongodb::connect_to_mongodb};
use crate::utils::get_env::get_env;
mod controllers;
mod entities;
mod utils;

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    // Load .env if available (used in development)
    dotenv().ok();

    dotenv().ok();
    let env_vars = get_env();
    let is_production =
        ["production", "staging"].contains(&env_vars.NEXT_PUBLIC_ENVIRONMENT.as_str());

    // Setup logging
    let logger = Logger::new(is_production);

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
                    .layer(
                        ServiceBuilder::new().layer(
                            TraceLayer::new_for_http()
                                .on_request({
                                    let logger: Arc<Logger> = logger.clone(); //
                                    move |request: &Request<_>, _span: &Span| {
                                        let logger = logger.clone(); // Clone the Arc for use within this closure

                                        let method = request.method().to_string();
                                        let uri = request.uri().to_string();
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

                                        tokio::spawn(async move {
                                            logger.debug(
                                                "Request received".to_string(),
                                                Some(json!({ "method": method,
                                                "uri": uri,
                                                "headers": headers })),
                                            );
                                        });
                                    }
                                })
                                .on_response({
                                    // ! TODO: Log response values
                                    let logger: Arc<Logger> = logger.clone();

                                    move |_response: &Response<_>,
                                          _latency: Duration,
                                          _span: &Span| {
                                        tokio::spawn(async move {
                                            let logger = logger.clone();
                                            logger.debug(
                                                "Response sent".to_string(),
                                                Some(json!({"todo": "todo"})),
                                            );
                                        });
                                    }
                                })
                                .on_failure({
                                    let logger: Arc<Logger> = logger.clone();

                                    move |error: ServerErrorsFailureClass,
                                          _latency: Duration,
                                          _span: &Span| {
                                        let logger = logger.clone();
                                        tokio::spawn(async move {
                                            let error_message =
                                                format!("Request failed: {:?}", error);
                                            logger.error(
                                                error_message,
                                                None,
                                                Some(json!({ "error": error.to_string() })),
                                            );
                                        });
                                    }
                                }),
                        ),
                    )
                    .layer(TimeoutLayer::new(std::time::Duration::from_secs(5)))
                    .layer(CompressionLayer::new())
                    .layer(Extension(mongodb))
                    .layer(Extension(logger.clone())),
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
