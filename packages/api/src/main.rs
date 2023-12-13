use axum::{
    routing::{get, post},
    Extension, Router,
};
use controllers::{health_check::health_check, not_found::not_found, totp::create_totp};
use dotenv::dotenv;
use std::sync::Arc;
use utils::connect_to_mongodb::connect_to_mongodb;

mod controllers;
mod entities;
mod utils;

#[tokio::main]
async fn main() {
    // Load .env if available (used in development)
    dotenv().ok();

    // Connect to database
    let mongodb = Arc::new(connect_to_mongodb().await);

    // Routes
    let totp_routes = Router::new().route("/totp", post(create_totp::create_totp));

    let app = Router::new().nest(
        "/api",
        Router::new()
            .merge(totp_routes)
            .route("/health", get(health_check))
            .fallback(not_found)
            .layer(Extension(mongodb)),
    );

    // Bind address
    let addr = match "[::]:8080".parse::<std::net::SocketAddr>() {
        Ok(addr) => addr,
        Err(_) => {
            // TODO: Log error
            panic!("Error parsing address");
        }
    };

    // Start the server
    match axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
    {
        Ok(_) => println!("Listening on {}", &addr),
        Err(e) => {
            // TODO: Log error
            panic!("Error binding address: {}", e)
        }
    }
}
