use mongodb::{options::ClientOptions, Client};

pub async fn connect_to_database() -> Client {
    let client_options = ClientOptions::parse("mongodb://localhost:27017")
        .await
        .unwrap();
    Client::with_options(client_options).unwrap()
}
