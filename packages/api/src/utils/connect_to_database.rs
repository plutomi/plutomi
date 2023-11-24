use super::get_env::get_env;
use crate::EntityType;
use core::panic;
use mongodb::{options::ClientOptions, Client, Collection, bson::Document};

pub struct Database {
    pub client: Client,
    pub collection: Collection<Document>,
}

pub async fn connect_to_database() -> Database {
    let env = get_env();

    // Parse the connection string into a client
    let client_options = match ClientOptions::parse(env.DATABASE_URL).await {
        Ok(client_options) => client_options,
        Err(e) => {
            // TODO: Log error
            panic!("Error parsing client options for DB: {}", e);
        }
    };

    // Get the DB client that's connected to the DB
    let client = match Client::with_options(client_options) {
        Ok(client) => client,
        Err(e) => {
            // TODO: Log error
            panic!("Error connecting to database: {}", e);
        }
    };

    let db = match client.default_database() {
        Some(db) => db,
        None => {
            // TODO: Log error
            // We want to error here so that we have one less .env variable to worry about with DB_NAME
            // So just panic if we can't find the default database in the connection string
            panic!("Unable to find default database.\nMake sure you include it in the connection string like: mongodb://localhost:27017/this-part-is-missing");
        }
    };

    Database {
        client,
        collection: db.collection("items"),
    }
}
