use axum::{routing::get, Extension, Router};
use controllers::{health_check::health_check, not_found::not_found};
use dotenv::dotenv;
use entities::EntityType;
use std::sync::Arc;
use utils::connect_to_database::connect_to_database;

mod controllers;
mod entities;
mod utils;

#[tokio::main]
async fn main() {
    // Load .env if available (used in development)
    dotenv().ok();

    // Connect to database
    let database = Arc::new(connect_to_database().await);

    // Routes
    let app = Router::new()
        .nest("/api", Router::new().route("/health", get(health_check)))
        .fallback(not_found)
        .layer(Extension(database));

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
