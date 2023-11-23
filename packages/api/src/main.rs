use axum::{routing::get, Router};
use controllers::{health_check::health_check, not_found::not_found};
use dotenv::dotenv;

mod controllers;
mod env;

#[tokio::main]
async fn main() {
    // Load .env if available (used in development)
    dotenv().ok();

    let app = Router::new()
        .nest("/api", Router::new().route("/health", get(health_check)))
        .fallback(not_found);

    let addr = "[::]:8080"
        .parse::<std::net::SocketAddr>()
        .expect("Error parsing localhost address");

    match axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
    {
        Ok(_) => println!("Listening on {}", &addr),
        Err(e) => println!("Error starting server: {}", e),
    }
}
