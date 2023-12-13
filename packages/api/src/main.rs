use axum::{
    http::Request,
    routing::{get, post},
    Extension, Router,
};
use controllers::{create_totp, health_check, not_found};
use core::panic;
use dotenv::dotenv;
use std::sync::Arc;
use tower::ServiceBuilder;
use tower_http::{
    compression::CompressionLayer, timeout::TimeoutLayer, trace::TraceLayer, BoxError,
};
use tracing::{debug, event, info, instrument, Level, Span};
use tracing_subscriber::prelude::*;

use utils::mongodb::connect_to_mongodb;
mod controllers;
mod entities;
mod utils;

#[instrument]
fn log() {
    info!("Hello, world!");
}

#[tokio::main]
async fn main() {
    // Load .env if available (used in development)
    dotenv().ok();

    // Connect to database
    let mongodb = Arc::new(connect_to_mongodb().await);

    let axiom_layer = tracing_axiom::builder()
        .with_service_name("fmt")
        .with_dataset("plutomi-logs".to_string())
        .with_token("XXXX".to_string())
        .layer()
        .unwrap();
    let fmt_layer = tracing_subscriber::fmt::layer().pretty();
    tracing_subscriber::registry()
        .with(fmt_layer.compact())
        .with(axiom_layer)
        .init();

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
                    // https://docs.rs/axum/latest/axum/middleware/index.html#ordering
                    .layer(TraceLayer::new_for_http().on_request(
                        |request: &Request<_>, span: &Span| {
                            // debug!("TEST LOG {} {}", request.method(), request.uri(),);
                            log();
                        },
                    ))
                    .layer(TimeoutLayer::new(std::time::Duration::from_secs(5)))
                    .layer(CompressionLayer::new())
                    .layer(Extension(mongodb)),
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
            println!("Listening on {}", &addr);
            log();
            log();
            log();
        }
        Err(e) => {
            // TODO: Log error
            panic!("Error binding address: {}", e)
        }
    }
}
