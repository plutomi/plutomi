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
    let database = Arc::new(connect_to_database::<EntityType>().await);

    // Routes
    let app = Router::new()
        .nest("/api", Router::new().route("/health", get(health_check)))
        .fallback(not_found)
        .layer(Extension(database));

    // Bind address
    let addr = "[::]:8080"
        .parse::<std::net::SocketAddr>()
        .unwrap_or_else(|e| panic!("Error parsing address: {}", e));

    // Start the server
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .map(|_| println!("Listening on {}", &addr))
        .unwrap_or_else(|e| panic!("Error binding address: {}", e));
}
