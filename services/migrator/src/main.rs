use shared::{
    get_env::get_env,
    logger::{LogObject, Logger, LoggerContext},
};
use sqlx::mysql::MySqlPool;

#[tokio::main(flavor = "current_thread")]
async fn main() {
    dotenvy::dotenv().ok();

    let logger = Logger::init(LoggerContext {
        application: "migrator",
    });

    logger.info(LogObject {
        message: "Running migrations!".to_string(),
        ..Default::default()
    });

    let env = get_env();

    let pool = MySqlPool::connect(&&env.MYSQL_URL).await;

    match pool {
        Ok(pool) => {
            let migration_result = sqlx::migrate!("./migrations").run(&pool).await;
            match migration_result {
                Ok(_) => {
                    logger.info(LogObject {
                        message: "Migrations ran successfully!".to_string(),
                        ..Default::default()
                    });
                }
                Err(e) => {
                    logger.error(LogObject {
                        message: format!("Failed to run migrations: {}", e),
                        ..Default::default()
                    });
                }
            }
        }
        Err(e) => {
            logger.error(LogObject {
                message: format!("Failed to connect to database: {}", e),
                ..Default::default()
            });
        }
    }
}
