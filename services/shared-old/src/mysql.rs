use crate::{
    get_env::get_env,
    logger::{LogObject, Logger},
};
use sqlx::mysql::{MySqlPool, MySqlPoolOptions};
use std::sync::Arc;

pub struct DBConfig {
    pub min_connections: u32,
    pub max_connections: u32,
}

pub struct MySQLClient {}

impl MySQLClient {
    pub async fn new(
        name: &'static str,
        logger: &Arc<Logger>,
        db_config: Option<DBConfig>,
    ) -> Result<Arc<MySqlPool>, String> {
        dotenvy::dotenv().ok();

        let env = get_env();
        logger.info(LogObject {
            message: format!("Connecting to database from {}", &name),
            ..Default::default()
        });

        let db_config = db_config.unwrap_or(DBConfig {
            min_connections: 2,
            max_connections: 5,
        });

        let pool = MySqlPoolOptions::new()
            .max_connections(db_config.min_connections)
            .min_connections(db_config.max_connections)
            .connect(&env.MYSQL_URL)
            .await
            .map_err(|e| {
                let message = format!("Failed to connect to database: {}", e);
                logger.error(LogObject {
                    message: message.clone(),
                    ..Default::default()
                });
                message
            })?;

        logger.info(LogObject {
            message: "Connected to database!".into(),
            ..Default::default()
        });

        Ok(Arc::new(pool))
    }
}
