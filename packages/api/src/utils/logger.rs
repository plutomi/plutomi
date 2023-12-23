use super::{get_current_time::get_current_time, get_env::get_env};
use axiom_rs::Client;
use axum::{extract::Request, http::Response};
use serde::Serialize;
use serde_json::json;
use std::{fmt, sync::Arc};
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
    // Format for easier reading in console
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
pub struct BaseLogObject {
    pub timestamp: String,
    pub message: String,
    pub data: Option<serde_json::Value>,
    pub error: Option<serde_json::Value>,
}

struct LogObject {
    level: LogLevel,
    log: BaseLogObject,
}

impl fmt::Display for LogObject {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        // Note: Not logging here timestamp or level because the tracing library already does it for us locally
        let mut components = vec![format!("{}", self.log.message)];

        if let Some(data) = &self.log.data {
            components.push(format!("\nData: {}", data));
        }

        if let Some(error) = &self.log.error {
            components.push(format!("\nError: {}", error));
        }

        write!(f, "{}", components.join(", "))
    }
}

pub struct Logger {
    sender: Sender<LogObject>,
}

// Send logs to axiom
async fn send_to_axiom(log_obj: LogObject, client: &Client) {
    let axiom_result = client
        .ingest(
            &get_env().AXIOM_DATASET,
            vec![json!({
                "level":    log_obj.level,
                "timestamp": log_obj.log.timestamp,
                "message":  log_obj.log.message,
                "data":     log_obj.log.data,
                "error":      log_obj.log.error,
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
                // Local logging based on the level
                match log.level {
                    LogLevel::Info => info!("{}", &log),
                    LogLevel::Error => error!("{}", &log),
                    LogLevel::Debug => debug!("{}", &log),
                    LogLevel::Warn => warn!("{}", &log),
                }

                if let Some(ref client) = axiom_client {
                    send_to_axiom(log, &client).await;
                }
            }
        });

        return Arc::new(Logger { sender });
    }

    fn log(&self, log: LogObject) {
        let sender = self.sender.clone();

        tokio::spawn(async move {
            if sender.send(log).await.is_err() {
                error!("Failed to enqueue log message")
            }
        });
    }

    pub fn info(&self, log: BaseLogObject) {
        self.log(LogObject {
            level: LogLevel::Info,
            log,
        });
    }

    pub fn warn(&self, log: BaseLogObject) {
        self.log(LogObject {
            level: LogLevel::Warn,
            log,
        });
    }

    pub fn error(&self, log: BaseLogObject) {
        self.log(LogObject {
            level: LogLevel::Error,
            log,
        });
    }

    pub fn debug(&self, log: BaseLogObject) {
        self.log(LogObject {
            level: LogLevel::Debug,
            log,
        });
    }
}
