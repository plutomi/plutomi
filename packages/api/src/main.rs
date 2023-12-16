use axiom_rs::Client;
use axum::{
    body::Bytes,
    http::{Request, Response},
    routing::{get, post},
    Extension, Router,
};

use controllers::{create_totp, health_check, not_found};
use core::panic;
use dotenv::dotenv;

use std::{sync::Arc, time::Duration};
use tower::{Layer, ServiceBuilder};
use tower_http::{
    classify::ServerErrorsFailureClass, compression::CompressionLayer, timeout::TimeoutLayer,
    trace::TraceLayer, BoxError,
};
use tracing::{info, Span};
use tracing_subscriber::{prelude::*, Registry};

use utils::{logger::Logger, mongodb::connect_to_mongodb};

use crate::utils::get_env::get_env;
mod controllers;
mod entities;
mod utils;

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    // Load .env if available (used in development)
    dotenv().ok();

    let env = &get_env().NEXT_PUBLIC_ENVIRONMENT;
    let is_production = ["production", "staging"].contains(&env.as_str());

    let logger = Arc::new(Logger::new(is_production));
    let logger_clone = logger.clone(); // Clone for use tracing middleware

    // Connect to database
    let mongodb = Arc::new(connect_to_mongodb().await);

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
                                    let logger = logger_clone.clone();
                                    move |_request: &Request<_>, _span: &Span| {
                                        let logger = logger.clone();
                                        tokio::spawn(async move {
                                            logger.debug("Request received".to_string());
                                        });
                                    }
                                })
                                .on_response({
                                    let logger = logger_clone.clone();
                                    move |_response: &Response<_>,
                                          _latency: Duration,
                                          _span: &Span| {
                                        let logger = logger.clone();
                                        tokio::spawn(async move {
                                            logger.debug("Request completed".to_string());
                                        });
                                    }
                                })
                                .on_failure({
                                    move |error: ServerErrorsFailureClass,
                                          _latency: Duration,
                                          _span: &Span| {
                                        let logger = logger_clone.clone();
                                        tokio::spawn(async move {
                                            let error_message =
                                                format!("Request failed: {:?}", error);
                                            logger.error(error_message);
                                        });
                                    }
                                }),
                        ),
                    )
                    .layer(TimeoutLayer::new(std::time::Duration::from_secs(5)))
                    .layer(CompressionLayer::new())
                    .layer(Extension(mongodb))
                    .layer(Extension(logger)),
            ),
    );

    // Bind address
    let addr = match "[::]:8080".parse::<std::net::SocketAddr>() {
        Ok(addr) => addr,
        Err(e) => {
            // TODO: Log error
            panic!("Error parsing address: {}", e);
        }
    };

    // Bind listener
    let listener = match tokio::net::TcpListener::bind(&addr).await {
        Ok(listener) => listener,
        Err(e) => {
            // TODO: Log error
            panic!("Error binding address: {}", e);
        }
    };

    // Start the server
    match axum::serve(listener, app).await {
        Ok(_) => {
            info!("Server started!!!");
        }
        Err(e) => {
            // TODO: Log error
            panic!("Error binding address: {}", e)
        }
    }
}
