use super::get_env::get_env;
use axiom_rs::Client;
use serde::Serialize;
use std::{fmt, sync::Arc};
use tokio::sync::mpsc::{self, Sender};
use tracing::{debug, error, info, warn, Level};
use tracing_subscriber::FmtSubscriber;

const MAX_LOG_BUFFER_LENGTH: usize = 10000;

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
    // TODO add environment
    pub level: LogLevel,
    /**
     * ISO 8601 timestamp
     * use iso_format()
     */
    pub timestamp: String,
    pub message: String,
    /**
     * Used for adding additional data to the log object
     */
    pub data: Option<serde_json::Value>,
    pub error: Option<serde_json::Value>,
    /**
     * Used for logging the request
     */
    pub request: Option<serde_json::Value>,
    /**
     * Used for logging the response
     */
    pub response: Option<serde_json::Value>,
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
            // Serialize the entire LogObject
            vec![serde_json::json!(log)],
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
    /**
     * Create a new logger instance.
     * This also spawns a long lived thread that will handle logging.
     */
    pub fn new(use_axiom: bool) -> Arc<Logger> {
        let env = &get_env();
        let axiom_client = if use_axiom {
            match Client::builder()
                .with_token(&env.AXIOM_TOKEN)
                .with_org_id(&env.AXIOM_ORG_ID)
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
        let sender: Sender<LogObject> = self.sender.clone();

        // Spawn a new thread to send the log to the logger thread
        tokio::spawn(async move {
            if sender.send(log).await.is_err() {
                error!("Failed to enqueue log message")
            }
        });
    }
}
