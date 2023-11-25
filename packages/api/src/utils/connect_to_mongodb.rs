use super::get_env::get_env;
use core::panic;
use mongodb::{bson::Document, options::ClientOptions, Client, Collection, Database};

pub struct MongoDB {
    pub client: Client,
    pub collection: Collection<Document>,
    pub database: Database,
}

pub async fn connect_to_mongodb() -> MongoDB {
    let env = get_env();

    // Parse the connection string into a client
    let client_options = match ClientOptions::parse(env.DATABASE_URL).await {
        Ok(client_options) => client_options,
        Err(e) => {
            // TODO: Log error
            // TODO: Again - we probably shouldn't panic here due to new health check setup
            panic!("Error parsing client options for DB: {}", e);
        }
    };

    // Get the DB client that's connected to the DB
    let client = match Client::with_options(client_options) {
        Ok(client) => client,
        Err(e) => {
            // TODO: Log error
            // TODO: Again - we probably shouldn't panic here due to new health check setup
            panic!("Error connecting to database: {}", e);
        }
    };

    let database = match client.default_database() {
        Some(db) => db,
        None => {
            // TODO: Log error
            // TODO: Again - we probably shouldn't panic here due to new health check setup
            // We want to error here so that we have one less .env variable to worry about with DB_NAME
            // So just panic if we can't find the default database in the connection string
            panic!("Unable to find default database.\nMake sure you include it in the connection string like: mongodb://localhost:27017/this-part-is-missing");
        }
    };

    MongoDB {
        client,
        collection: database.collection("items"),
        database,
    }
}
