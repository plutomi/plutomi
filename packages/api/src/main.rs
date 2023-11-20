use axum::{routing::get, Router};

pub mod utils;


#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(|| async { 
   
    
        format!("Hello from rust prod:D")
    }
    ));

    axum::Server::bind(&"0.0.0.0:8080".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
