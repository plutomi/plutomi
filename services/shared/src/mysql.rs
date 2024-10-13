use crate::logger::{LogObject, Logger};
use sqlx::mysql::{MySqlPool, MySqlPoolOptions};

pub struct DBConfig {
    pub min_connections: u32,
    pub max_connections: u32,
}
pub async fn connect_to_database(
    url: &str,
    logger: &Logger,
    db_config: Option<DBConfig>,
) -> Result<MySqlPool, sqlx::Error> {
    logger.info(LogObject {
        message: "Connecting to database...".into(),
        ..Default::default()
    });

    // Set default values for db_config
    let db_config = db_config.unwrap_or(DBConfig {
        min_connections: 1,
        max_connections: 5,
    });

    let pool = MySqlPoolOptions::new()
        .max_connections(db_config.min_connections)
        .min_connections(db_config.max_connections)
        .connect(url)
        .await?;

    logger.info(LogObject {
        message: "Connected to database!".into(),
        ..Default::default()
    });

    Ok(pool)
}
