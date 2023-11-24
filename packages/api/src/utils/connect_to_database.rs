use super::get_env::get_env;
use crate::EntityType;
use core::panic;
use mongodb::{options::ClientOptions, Client, Collection};

const COLLECTION_NAME: &str = "items";
const ERROR_MISSING_COLLECTION_NAME: &str = "Unable to find default collection. Make sure you include it in the connection string like: mongodb://localhost:27017/this-part-is-missing";
const ERROR_CONNECTING_TO_DATABASE: &str = "Error connecting to database";
const ERROR_PARSING_DATABASE_URL: &str = "Error parsing database URL";

pub struct Database {
    pub client: Client,
    pub collection: Collection<EntityType>,
}

pub async fn connect_to_database<T>() -> Database {
    let env = get_env();

    let client_options = ClientOptions::parse(env.DATABASE_URL)
        .await
        .unwrap_or_else(|e| {
            panic!("{}: {}", ERROR_PARSING_DATABASE_URL, e);
        });

    let client = Client::with_options(client_options).unwrap_or_else(|e| {
        panic!("{}: {}", ERROR_CONNECTING_TO_DATABASE, e);
    });

    let db = client.default_database().unwrap_or_else(|| {
        // We want to error here so that we have one less .env variable to worry about with DB_NAME
        // So just panic if we can't find the default database in the connection string
        panic!("{}", ERROR_MISSING_COLLECTION_NAME);
    });

    let collection = db.collection(COLLECTION_NAME);

    Database { client, collection }
}
