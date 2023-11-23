use axum::{routing::get, Router};
use serde::{Deserialize, Serialize};

mod controllers;
mod utils;

use controllers::health_check::health_check;
use controllers::not_found::not_found;

#[derive(Serialize, Deserialize)]
struct Person {
    name: String,
}

#[tokio::main]
async fn main() {
    let all_routes = Router::new().route("/health", get(health_check));

    let app = Router::new().nest("/api", all_routes).fallback(not_found);

    let addr = "[::]:8080"
        .parse::<std::net::SocketAddr>()
        .expect("Error parsing localhost:8080");

    match axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
    {
        Ok(_) => println!("Listening on {}", &addr),
        Err(e) => println!("Error starting server: {}", e),
    }
}
