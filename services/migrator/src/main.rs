use shared::{
    logger::{LogObject, Logger, LoggerContext},
    mysql::MySQLClient,
    sleep_and_exit::sleep_and_exit,
};
use sqlx::{MySql, Pool};

async fn run_migrations(mysql: &Pool<MySql>, logger: &Logger) -> Result<(), sqlx::Error> {
    logger.info(LogObject {
        message: "Running migrations!".into(),
        ..Default::default()
    });

    sqlx::migrate!("./migrations").run(mysql).await?;

    Ok(())
}

const APP_NAME: &str = "migrator";

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), String> {
    dotenvy::dotenv().ok();

    let logger = Logger::init(LoggerContext {
        application: &APP_NAME,
    })?;

    let mysql = MySQLClient::new(&APP_NAME, &logger, None).await?;

    match run_migrations(&*mysql, &logger).await {
        Ok(_) => {
            logger.info(LogObject {
                message: "Migrations ran successfully!".into(),
                ..Default::default()
            });
            Ok(sleep_and_exit(1).await)
        }
        Err(e) => {
            logger.error(LogObject {
                message: format!("Failed to run migrations: {:?}", e),
                ..Default::default()
            });
            Ok(sleep_and_exit(1).await)
        }
    }
}
