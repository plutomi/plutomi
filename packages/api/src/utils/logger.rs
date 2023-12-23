use std::{fmt, sync::Arc};

use super::get_env::get_env;
use axiom_rs::Client;
use serde::Serialize;
use serde_json::json;
use time::{format_description, macros::format_description, OffsetDateTime};
use tokio::sync::mpsc::{self, Sender};
use tracing::{debug, error, info, warn, Level};
use tracing_subscriber::FmtSubscriber;

const MAX_LOG_BUFFER_LENGTH: usize = 1000;

#[derive(Serialize, Debug)]
enum LogLevel {
    Info,
    Error,
    Debug,
    Warn,
}

impl fmt::Display for LogLevel {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let level_str = match self {
            LogLevel::Info => "INFO",
            LogLevel::Error => "ERROR",
            LogLevel::Debug => "DEBUG",
            LogLevel::Warn => "WARN",
        };
        write!(f, "{}", level_str)
    }
}

#[derive(Serialize, Debug)]
struct LogObject {
    timestamp: String,
    level: LogLevel,
    message: String,
    data: Option<serde_json::Value>,
    error: Option<serde_json::Value>,
}

impl fmt::Display for LogObject {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        // Note: Not logging here timestamp or level because the tracing library already does it for us locally
        let mut components = vec![format!("{}", self.message)];

        if let Some(data) = &self.data {
            components.push(format!("\nData: {}", data));
        }

        if let Some(error) = &self.error {
            components.push(format!("\nError: {}", error));
        }

        write!(f, "{}", components.join(", "))
    }
}

pub struct Logger {
    sender: Sender<LogObject>,
}

fn format_timestamp() -> String {
    // Define the format for the main part of the timestamp
    let format = format_description!("[year]-[month]-[day]T[hour]:[minute]:[second]");

    let now = OffsetDateTime::now_utc();
    let formatted = now.format(&format).expect("Timestamp formatting failed");

    // Get the milliseconds and format them with three decimal places
    let milliseconds = now.millisecond();
    format!("{}.{:03}", formatted, milliseconds)
}

// Send logs to axiom
async fn send_to_axiom(
    level: &String,
    message: String,
    data: Option<serde_json::Value>,
    error: Option<serde_json::Value>,
    client: &Client,
) {
    let axiom_result = client
        .ingest(
            &get_env().AXIOM_DATASET,
            vec![json!({
                "level":    level,
                "message":  message,
                "data":     data,
                "error":      error,
            })],
        )
        .await;

    match axiom_result {
        Ok(_) => {}
        Err(e) => {
            error!("Failed to send log to Axiom: {}", e);
        }
    }
}

impl Logger {
    pub fn new(use_axiom: bool) -> Arc<Logger> {
        let axiom_client = if use_axiom {
            match Client::builder()
                .with_token(&get_env().AXIOM_TOKEN)
                .with_org_id(&get_env().AXIOM_ORG_ID)
                .build()
            {
                Ok(client) => Some(client),
                Err(_) => panic!("Failed to initialize Axiom client in a production environment"),
            }
        } else {
            warn!("Axiom logging is not enabled");
            None
        };

        let subscriber = FmtSubscriber::builder()
            .with_max_level(Level::DEBUG)
            .finish();

        tracing::subscriber::set_global_default(subscriber)
            .expect("Setting default logging subscriber failed");

        let (sender, mut receiver) = mpsc::channel::<LogObject>(MAX_LOG_BUFFER_LENGTH);

        tokio::spawn(async move {
            // Spawn the logging thread
            while let Some(log) = receiver.recv().await {
                let level_str = format!("{:?}", log.level); // Format log level

                // Local logging based on the level
                match log.level {
                    LogLevel::Info => info!("{}", &log),
                    LogLevel::Error => error!("{}", &log),
                    LogLevel::Debug => debug!("{}", &log),
                    LogLevel::Warn => warn!("{}", &log),
                }

                if let Some(ref client) = axiom_client {
                    send_to_axiom(&level_str, log.message, log.data, log.error, &client).await;
                }
            }
        });

        return Arc::new(Logger { sender });
    }

    fn log(
        &self,
        level: LogLevel,
        message: String,
        data: Option<serde_json::Value>,
        error: Option<serde_json::Value>,
    ) {
        let sender = self.sender.clone();
        tokio::spawn(async move {
            if sender
                .send(LogObject {
                    timestamp: format_timestamp(),
                    level,
                    message,
                    data,
                    error,
                })
                .await
                .is_err()
            {
                error!("Failed to enqueue log message")
            }
        });
    }

    pub fn info(&self, message: String, data: Option<serde_json::Value>) {
        self.log(LogLevel::Info, message, data, None);
    }

    pub fn warn(&self, message: String, data: Option<serde_json::Value>) {
        self.log(LogLevel::Warn, message, data, None);
    }

    pub fn error(
        &self,
        message: String,
        data: Option<serde_json::Value>,
        error: Option<serde_json::Value>,
    ) {
        self.log(LogLevel::Error, message, data, error);
    }

    pub fn debug(&self, message: String, data: Option<serde_json::Value>) {
        self.log(LogLevel::Debug, message, data, None);
    }
}
