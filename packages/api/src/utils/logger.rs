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
pub enum LogLevel {
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

pub struct LogObject {
    pub level: LogLevel,
    pub timestamp: String,
    pub message: String,
    pub data: Option<serde_json::Value>,
    pub error: Option<serde_json::Value>,
    pub request: Option<serde_json::Value>,
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

// Send logs to axiom
async fn send_to_axiom(log: LogObject, client: &Client) {
    let axiom_result = client
        .ingest(
            &get_env().AXIOM_DATASET,
            vec![serde_json::json!(log)], // Serialize the entire LogObject
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

    pub fn log(&self, log: LogObject) {
        let sender = self.sender.clone();

        tokio::spawn(async move {
            if sender.send(log).await.is_err() {
                error!("Failed to enqueue log message")
            }
        });
    }
}
