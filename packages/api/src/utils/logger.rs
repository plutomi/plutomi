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
struct LogMessage {
    timestamp: String,
    level: LogLevel,
    message: String,
    data: Option<serde_json::Value>,
    error: Option<serde_json::Value>,
}

impl fmt::Display for LogMessage {
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
    sender: Sender<LogMessage>,
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

impl Logger {
    pub fn new(use_axiom: bool) -> Arc<Logger> {
        let axiom_client = if use_axiom {
            Some(
                Client::builder()
                    .with_token(&get_env().AXIOM_TOKEN)
                    .with_org_id(&get_env().AXIOM_ORG_ID)
                    .build()
                    .expect("Failed to build Axiom client"),
            )
        } else {
            None
        };

        let subscriber = FmtSubscriber::builder()
            .with_max_level(Level::DEBUG)
            .finish();

        tracing::subscriber::set_global_default(subscriber)
            .expect("setting default logging subscriber failed");

        let (sender, mut receiver) = mpsc::channel::<LogMessage>(MAX_LOG_BUFFER_LENGTH);

        // Spawn the logging thread
        let client_clone = axiom_client.clone();
        tokio::spawn(async move {
            while let Some(log) = receiver.recv().await {
                let level_str = format!("{:?}", log.level);

                // TODO: In the future we can batch logs instead of one by one
                match log.level {
                    LogLevel::Info => {
                        if let Some(client) = &client_clone {
                            if let Err(e) = client
                                .ingest(
                                    &get_env().AXIOM_DATASET,
                                    vec![json!({
                                        "level":    level_str,
                                        "message":  log.message,
                                        "data":     log.data,
                                    })],
                                )
                                .await
                            {
                                error!("Failed to send log to Axiom: {}", e);
                            }
                        }

                        info!("{}", log);
                    }

                    LogLevel::Error => {
                        error!("{}", log);
                    }

                    LogLevel::Debug => {
                        debug!("{}", log);
                    }
                    LogLevel::Warn => {
                        warn!("{}", log);
                    }
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
                .send(LogMessage {
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
