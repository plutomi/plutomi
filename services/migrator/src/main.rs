use shared::{
    get_current_time::get_current_time,
    get_env::get_env,
    logger::{LogLevel, LogObject, Logger, LoggerContext},
};
use time::OffsetDateTime;

#[tokio::main(flavor = "current_thread")]
async fn main() {
    dotenvy::dotenv().ok();

    let logger = Logger::init(LoggerContext { caller: "migrator" });

    logger.info(LogObject {
        message: "Running migrations!".to_string(),
        _time: get_current_time(OffsetDateTime::now_utc()),
        data: None,
        error: None,
        request: None,
        response: None,
    });
}
