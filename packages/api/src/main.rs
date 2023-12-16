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
    compression::CompressionLayer, timeout::TimeoutLayer, trace::TraceLayer, BoxError,
};
use tracing::{debug, error, event, info, instrument, Level, Span};
use tracing_subscriber::{prelude::*, Registry};

use utils::{get_env::get_env, logger::Logger, mongodb::connect_to_mongodb};
mod controllers;
mod entities;
mod utils;

#[tracing::instrument]
pub fn say_hello() {
    tracing::info!("Hello, world!");
}

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    // Load .env if available (used in development)
    dotenv().ok();
    info!("Starting server");

    let logger = Arc::new(Logger::new());
    let logger_clone = logger.clone();

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
                    .layer(TraceLayer::new_for_http().on_request({
                        move |request: &Request<_>, _span: &Span| {
                            let logger = logger_clone.clone();
                            tokio::spawn(async move {
                                logger.info("Request received".to_string());
                            });
                        }
                    }))
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

            println!("Hello, world!");
        }
        Err(e) => {
            // TODO: Log error
            panic!("Error binding address: {}", e)
        }
    }
}
