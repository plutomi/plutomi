use shared::logger::{LogObject, Logger, LoggerContext};

#[tokio::main(flavor = "current_thread")]
async fn main() {
    dotenvy::dotenv().ok();

    let logger = Logger::init(LoggerContext { caller: "migrator" });

    logger.info(LogObject {
        message: "Running migrations!".to_string(),
        ..Default::default()
    });
}
