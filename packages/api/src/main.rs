use axum::{routing::get, Router};

#[tokio::main]
async fn main() {
    let app = Router::new().route("/ssr", get(|| async { "Hello from rust!" }));

    axum::Server::bind(&"0.0.0.0:8080".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
