use super::get_env::get_env;
use axiom_rs::Client;
use serde::Serialize;
use std::{fmt, sync::Arc};
use time::{Duration, Instant};
use tokio::sync::mpsc::{self, Sender};
use tracing::{debug, error, info, warn, Level};
use tracing_subscriber::FmtSubscriber;

const MAX_LOG_BUFFER_LENGTH: usize = 10000;
// max number of logs to send in a batch
const LOG_BATCH_SIZE: usize = 100;
// time to wait before sending the batch
const LOG_BATCH_TIME: Duration = Duration::seconds(5);

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
async fn send_to_axiom(log_batch: &Vec<LogObject>, client: &Client) {
    if let Err(e) = client.ingest(&get_env().AXIOM_DATASET, log_batch).await {
        error!("Failed to send log to Axiom: {}", e);
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
            Some(
                Client::builder()
                    .with_token(&env.AXIOM_TOKEN)
                    .with_org_id(&env.AXIOM_ORG_ID)
                    .build()
                    .expect("Failed to initialize Axiom client in a production environment"),
            )
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

        // Spawn the logging thread
        tokio::spawn(async move {
            //
            let mut log_batch: Vec<LogObject> = Vec::new();
            let mut timer = Instant::now() + LOG_BATCH_TIME;

            while let Some(log) = receiver.recv().await {
                // Local logging based on the level
                match log.level {
                    LogLevel::Info => info!("{}", &log),
                    LogLevel::Error => error!("{}", &log),
                    LogLevel::Debug => debug!("{}", &log),
                    LogLevel::Warn => warn!("{}", &log),
                }

                // Push the log to the buffer
                log_batch.push(log);

                if log_batch.len() >= LOG_BATCH_SIZE || time_limit_reached {
                    if let Some(ref client) = axiom_client {
                        // Send batch of logs
                        send_to_axiom(&log_batch, &client).await;
                        // Clear the buffer
                        log_batch.clear();
                    }
                }
            }
        });

        return Arc::new(Logger { sender });
    }

    // pub fn log(&self, log: LogObject) {
    //     let sender: Sender<LogObject> = self.sender.clone(); ! <--

    //      Spawn a new thread to send the log to the logger thread
    //     tokio::spawn(async move {
    //         if sender.send(log).await.is_err() {
    //             error!("Failed to enqueue log message")
    //         }
    //     });
    // }

    pub fn log(&self, log: LogObject) {
        // Send the log message to the channel
        if let Err(e) = self.sender.try_send(log) {
            error!("Failed to enqueue log message: {}", e);
        }
    }
}
