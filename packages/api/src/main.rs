use axum::{
    routing::get, 
    Router, 
    Extension
};
use mongodb::{options::ClientOptions, Client, Collection};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower::ServiceBuilder;

#[derive(Serialize, Deserialize)]
struct Person {
    name: String,
}

#[tokio::main]
async fn main() {
    let client_options = ClientOptions::parse("mongodb+srv://jose-dev-local:HhaVozprvB63fLdD@plutomi.pd4tt.mongodb.net/").await.unwrap();
    let client = Client::with_options(client_options).unwrap();
    let database = client.database("mydb");
    let collection: Collection<Person> = database.collection("mycollection");

    let shared_collection = Arc::new(collection);

    let app = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/insert", get(insert_person))
        .layer(ServiceBuilder::new().layer(Extension(shared_collection)));

    let addr = "[::]:8080".parse::<std::net::SocketAddr>().unwrap();
        // println!("Listening on {}", &addr);
    axum::Server::bind(&addr).serve(app.into_make_service()).await.unwrap();
}

async fn health_check() -> &'static str {
    "Hello from rust prod:D"
}

async fn insert_person(Extension(collection): Extension<Arc<Collection<Person>>>) -> &'static str {
    let new_person = Person {
        name: "Jose Valerio".to_string(),
    };

    collection.insert_one(new_person, None).await.unwrap();

    "Hello from rust prod:D"
}
