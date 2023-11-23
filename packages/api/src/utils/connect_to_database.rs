use super::get_env::get_env;
use core::panic;
use mongodb::{options::ClientOptions, Client};

pub async fn connect_to_database() -> Client {
    let env = get_env();

    let client_options = ClientOptions::parse(env.DATABASE_URL)
        .await
        .unwrap_or_else(|e| {
            panic!("Error parsing database URL: {}", e);
        });

    let client = Client::with_options(client_options).unwrap_or_else(|e| {
        panic!("Error connecting to database: {}", e);
    });

    client
}
