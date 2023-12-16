use std::sync::Arc;

use super::get_env::get_env;
use axiom_rs::Client;
use serde_json::json;
use time::OffsetDateTime;
use tokio::sync::mpsc::{self, Sender};
use tracing::{debug, error, info, warn, Level};
use tracing_subscriber::FmtSubscriber;

const MAX_LOG_BUFFER_LENGTH: usize = 1000;

enum LogLevel {
    Info,
    Error,
    Debug,
    Warn,
}

struct LogMessage {
    level: LogLevel,
    message: String,
    data: Option<serde_json::Value>,
    error: Option<serde_json::Value>,
}

pub struct Logger {
    sender: Sender<LogMessage>,
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
                // TODO: In the future we can batch logs instead of one by one
                match log.level {
                    LogLevel::Info => {
                        if let Some(client) = &client_clone {
                            if let Err(e) = client
                                .ingest(
                                    &get_env().AXIOM_DATASET,
                                    vec![json!({
                                        "foo":  log.message,
                                    })],
                                )
                                .await
                            {
                                eprintln!("Failed to send log to Axiom: {}", e);
                            }
                        }

                        let now = OffsetDateTime::now_utc();
                        info!("{} INFO: {}", now, log.message);
                    }

                    LogLevel::Error => {
                        error!("{}", log.message);
                    }

                    LogLevel::Debug => {
                        debug!("{}", log.message);
                    }
                    LogLevel::Warn => {
                        warn!("{}", log.message);
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
        self.log(LogLevel::Error, message, data, None);
    }

    pub fn debug(&self, message: String, data: Option<serde_json::Value>) {
        self.log(LogLevel::Debug, message, data, None);
    }
}
