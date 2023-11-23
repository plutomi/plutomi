use core::panic;

use super::get_env::get_env;
use mongodb::{options::ClientOptions, Client};

pub async fn connect_to_database() -> Client {
    let env = get_env();

    let client_options = match ClientOptions::parse(env.DATABASE_URL).await {
        Ok(client_options) => client_options,
        Err(e) => {
            panic!("Error parsing database URL: {}", e);
        }
    };

    let client = match Client::with_options(client_options) {
        Ok(client) => client,
        Err(e) => {
            panic!("Error connecting to database: {}", e);
        }
    };

    client
}
