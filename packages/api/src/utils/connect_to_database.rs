use super::get_env::get_env;
use crate::EntityType;
use core::panic;
use mongodb::{options::ClientOptions, Client, Collection};

pub struct Database {
    pub client: Client,
    pub collection: Collection<EntityType>,
}

pub async fn connect_to_database<T>() -> Database {
    let env = get_env();

    let client_options = ClientOptions::parse(env.DATABASE_URL)
        .await
        .unwrap_or_else(|e| {
            panic!("Error parsing database URL: {}", e);
        });

    let client = Client::with_options(client_options).unwrap_or_else(|e| {
        panic!("Error connecting to database: {}", e);
    });

    let db = client.default_database().unwrap_or_else(|| {
        // We want to error here so that we have one less .env variable to worry about with DB_NAME
        // So just panic if we can't find the default database in the connection string
        panic!("Unable to find default collection.\nMake sure you include it in the connection string like: mongodb://localhost:27017/this-part-is-missing");
    });

    let collection = db.collection("items");

    Database { client, collection }
}
