use core::panic;
use mongodb::{
    bson::Document,
    options::{ClientOptions, ReadConcern, WriteConcern},
    Client, Collection, Database,
};
use serde_json::json;

use std::sync::Arc;
use time::OffsetDateTime;

use crate::{
    get_current_time::get_current_time,
    get_env::get_env,
    logger::{LogLevel, LogObject, Logger},
};

pub struct MongoDB {
    pub client: Client,
    pub collection: Collection<Document>,
    pub database: Database,
}

pub async fn connect_to_mongodb(logger: &Arc<Logger>) -> Arc<MongoDB> {
    let env = get_env();

    // Parse the connection string into a client
    let mut client_options = match ClientOptions::parse(env.MONGODB_URL).await {
        Ok(client_options) => client_options,
        Err(e) => {
            logger.log(LogObject {
                level: LogLevel::Error,
                _time: get_current_time(OffsetDateTime::now_utc()),
                message: "Error parsing client options for DB".to_string(),
                data: None,
                error: Some(json!(e.to_string())),
                request: None,
                response: None,
            });

            panic!("Error parsing client options for DB: {}", e);
        }
    };

    // Some DB options
    client_options.min_pool_size = Some(5);
    client_options.max_pool_size = Some(15);

    client_options.read_concern = Some(ReadConcern::majority());
    client_options.write_concern = Some(WriteConcern::majority());

    // Get the DB client that's connected to the DB
    let client = match Client::with_options(client_options) {
        Ok(client) => client,
        Err(e) => {
            logger.log(LogObject {
                level: LogLevel::Error,
                _time: get_current_time(OffsetDateTime::now_utc()),
                message: "Error connecting to database".to_string(),
                data: None,
                error: Some(json!(e.to_string())),
                request: None,
                response: None,
            });

            panic!("Error connecting to database: {}", e);
        }
    };

    let database = match client.default_database() {
        Some(db) => db,
        None => {
            let error_message = "Unable to find default database.\nMake sure you include it in the connection string like: mongodb://localhost:27017/this-part-is-missing";
            logger.log(LogObject {
                level: LogLevel::Error,
                _time: get_current_time(OffsetDateTime::now_utc()),
                message: error_message.to_string(),
                data: None,
                error: None,
                request: None,
                response: None,
            });

            panic!("{}", error_message);
        }
    };

    return Arc::new(MongoDB {
        client,
        collection: database.collection("items"),
        database,
    });
}
