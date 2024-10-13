use shared::{
    get_env::get_env,
    logger::{LogObject, Logger, LoggerContext},
    mysql::connect_to_database,
    sleep_and_exit::sleep_and_exit,
};
use sqlx::mysql::MySqlPool;

async fn run_migrations(pool: &MySqlPool, logger: &Logger) -> Result<(), sqlx::Error> {
    logger.info(LogObject {
        message: "Running migrations!".into(),
        ..Default::default()
    });

    sqlx::migrate!("./migrations").run(pool).await?;

    Ok(())
}

#[tokio::main(flavor = "current_thread")]
async fn main() {
    dotenvy::dotenv().ok();

    let logger = Logger::init(LoggerContext {
        application: "migrator",
    });

    let env = get_env();

    let pool = match connect_to_database(&env.MYSQL_URL, &logger, {
        Some(shared::mysql::DBConfig {
            min_connections: 1,
            max_connections: 1,
        })
    })
    .await
    {
        Ok(pool) => pool,
        Err(e) => {
            logger.error(LogObject {
                message: format!("Failed to connect to database: {}", e),
                ..Default::default()
            });
            sleep_and_exit(1).await
        }
    };

    match run_migrations(&pool, &logger).await {
        Ok(_) => {
            logger.info(LogObject {
                message: "Migrations ran successfully!".into(),
                ..Default::default()
            });
            sleep_and_exit(1).await;
        }
        Err(e) => {
            logger.error(LogObject {
                message: format!("Failed to run migrations: {:?}", e),
                ..Default::default()
            });
            sleep_and_exit(1).await;
        }
    }
}
