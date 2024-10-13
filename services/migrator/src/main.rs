use shared::{
    get_env::get_env,
    logger::{LogObject, Logger, LoggerContext},
};
use sqlx::mysql::MySqlPool;
use tokio::time::{sleep, Duration};

async fn sleep_and_exit(seconds: u64) -> ! {
    sleep(Duration::from_secs(seconds)).await;
    std::process::exit(1);
}

async fn connect_to_database(url: &str, logger: &Logger) -> Result<MySqlPool, sqlx::Error> {
    logger.info(LogObject {
        message: "Connecting to database...".into(),
        ..Default::default()
    });

    let pool = MySqlPool::connect(url).await?;

    logger.info(LogObject {
        message: "Connected to database!".into(),
        ..Default::default()
    });

    Ok(pool)
}

async fn run_migrations(pool: &MySqlPool, logger: &Logger) -> Result<(), sqlx::Error> {
    logger.info(LogObject {
        message: "Running migrations!".into(),
        ..Default::default()
    });

    sqlx::migrate!("./migrations").run(pool).await?;

    logger.info(LogObject {
        message: "Migrations ran successfully!".into(),
        ..Default::default()
    });

    Ok(())
}

#[tokio::main(flavor = "current_thread")]
async fn main() {
    dotenvy::dotenv().ok();

    let logger = Logger::init(LoggerContext {
        application: "migrator",
    });

    let env = get_env();

    let pool = match connect_to_database(&env.MYSQL_URL, &logger).await {
        Ok(pool) => pool,
        Err(e) => {
            logger.error(LogObject {
                message: format!("Failed to connect to database: {}", e),
                ..Default::default()
            });
            sleep_and_exit(1).await
        }
    };

    if let Err(e) = run_migrations(&pool, &logger).await {
        logger.error(LogObject {
            message: format!("Failed to run migrations: {:?}", e),
            ..Default::default()
        });
        sleep_and_exit(1).await;
    }
}
