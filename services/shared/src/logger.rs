use crate::{get_current_time::get_current_time, get_env::get_env};
use axiom_rs::Client;
use serde::Serialize;
use std::{fmt, sync::Arc};
use time::OffsetDateTime;
use tokio::{
    sync::mpsc::{self, UnboundedSender},
    time::{sleep, Duration, Instant},
};
use tracing::{debug, error, info, warn};
use tracing_subscriber::{
    fmt::{format::Writer, time::FormatTime},
    FmtSubscriber,
};

// Max number of logs to send in a batch
const LOG_BATCH_SIZE: usize = 100;
// Time to wait before sending the batch of logs
const LOG_BATCH_TIME: Duration = Duration::from_secs(5);

#[derive(Serialize, Debug)]
pub enum LogLevel {
    Info,
    Error,
    Debug,
    Warn,
    Trace,
}

impl fmt::Display for LogLevel {
    // Format for easier reading in console
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let level_str = match self {
            LogLevel::Info => "INFO",
            LogLevel::Error => "ERROR",
            LogLevel::Debug => "DEBUG",
            LogLevel::Warn => "WARN",
            LogLevel::Trace => "TRACE",
        };
        write!(f, "{}", level_str)
    }
}

#[derive(Serialize, Debug)]
pub struct LogObject {
    /**
     * ISO 8601 timestamp
     * use iso_format()
     *
     * Axiom uses `_time` so we can use it as well
     */
    pub _time: String,
    pub message: String,
    /**
     * Used for adding additional data to the log object
     */
    pub data: Option<serde_json::Value>,
    pub error: Option<serde_json::Value>,
}

#[derive(Serialize, Debug)]
pub struct LogObjectWithLevel {
    pub level: LogLevel,
    // TODO rename this
    pub log: LogObject,
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

impl fmt::Display for LogObjectWithLevel {
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
    sender: UnboundedSender<LogObjectWithLevel>,
}

struct CustomTimeFormat;

/**
* Overwrites the 5 decimal places on milliseconds to one with 3 decimal places
*/
impl FormatTime for CustomTimeFormat {
    fn format_time(&self, writer: &mut Writer<'_>) -> fmt::Result {
        let now = OffsetDateTime::now_utc();
        let formatted_time = get_current_time(now);
        write!(writer, "{}", formatted_time)
    }
}
// Send logs to axiom
async fn send_to_axiom(
    log_batch: &Vec<LogObjectWithLevel>,
    client: &Client,
    axiom_dataset: &String,
) {
    if let Err(e) = client.ingest(axiom_dataset, log_batch).await {
        error!("Failed to send log to Axiom: {}", e);
    }
}

pub struct LoggerContext {
    pub caller: &'static str,
}

impl Logger {
    /**
     * Create a new logger instance.
     * This also spawns a long lived thread that will handle logging.
     */
    pub fn init(context: LoggerContext) -> Arc<Logger> {
        let subscriber = FmtSubscriber::builder()
            .with_timer(CustomTimeFormat)
            .pretty()
            .with_max_level(tracing::Level::DEBUG) // Adjust this level as needed
            .with_target(false)
            .finish();

        tracing::subscriber::set_global_default(subscriber)
            .expect("Setting default logging subscriber failed");

        let env = get_env();
        let axiom_client = if env.axiom_configured() {
            debug!("Axiom is configured!");
            Some(
                Client::builder()
                    .with_token(env.AXIOM_TOKEN.as_ref().expect("AXIOM_TOKEN not found"))
                    .with_org_id(env.AXIOM_ORG_ID.as_ref().expect("AXIOM_ORG_ID not found"))
                    .build()
                    .expect("Failed to initialize Axiom client"),
            )
        } else {
            warn!("Axiom isn't configured! Logging will only happen locally.");
            None
        };

        let (sender, mut receiver) = mpsc::unbounded_channel::<LogObjectWithLevel>();

        // Spawn the logging thread
        tokio::spawn(async move {
            let mut log_batch: Vec<LogObjectWithLevel> = Vec::new();
            let mut timer = Instant::now() + LOG_BATCH_TIME;

            loop {
                // Check for messages & start a timer in parallel, call whichever comes first
                tokio::select! {
                    // Receive log messages
                    Some(log) = receiver.recv() => {


                        // Local logging based on the level
                            match log.level {
                                LogLevel::Info => info!("{}", &log),
                                LogLevel::Error => error!("{}", &log),
                                LogLevel::Debug => debug!("{}", &log),
                                LogLevel::Warn => warn!("{}", &log),
                                LogLevel::Trace => debug!("{}", &log),
                            }


                        // Push the log to the batch
                        log_batch.push(log);

                        // Check if the batch is full and send it to Axiom if so
                        if log_batch.len() >= LOG_BATCH_SIZE {
                            if let Some(ref client) = axiom_client {
                                // TODO remove expect / clean this up https://github.com/plutomi/plutomi/issues/996
                                 send_to_axiom(&log_batch, &client, &env.AXIOM_DATASET.as_ref().expect("AXIOM_DATASET not found") ).await;
                            }
                            // Clear the batch for the next batch
                            log_batch.clear();

                            // Reset the timer
                            timer = Instant::now() + LOG_BATCH_TIME;
                        }
                    },
                    // Start a timer for LOG_BATCH_TIME.
                    // If the timer triggers before  the batch is full, send the batch
                    _ = sleep_until(timer) => {
                        if !log_batch.is_empty() {
                           // Send whatever is in the batch
                            if let Some(ref client) = axiom_client {
                                // TODO remove expect / clean this up https://github.com/plutomi/plutomi/issues/996
                                send_to_axiom(&log_batch, &client, &env.AXIOM_DATASET.as_ref().expect("AXIOM_DATASET not found") ).await;
                            }

                            // Clear the batch for the next batch
                            log_batch.clear();
                        }
                        // Reset the timer to start counting up again
                        timer = Instant::now() + LOG_BATCH_TIME;
                    }
                }
            }
        });

        let logger = Arc::new(Logger { sender });

        logger.info(LogObject {
            message: format!("{} initialized", context.caller),
            ..Default::default()
        });
        return logger;
    }

    /**
     * Log a message asynchronously.
     */
    fn log(&self, log: LogObjectWithLevel) {
        // Send the log message to the channel
        if let Err(e) = self.sender.send(log) {
            error!("Failed to enqueue log message: {}", e);
            // TODO Alert if no logs in a specified amount of time
        }
    }

    /// Convenience methods for each log level.
    pub fn info(&self, log: LogObject) {
        self.log(LogObjectWithLevel {
            level: LogLevel::Info,
            log,
        });
    }

    pub fn warn(&self, log: LogObject) {
        self.log(LogObjectWithLevel {
            level: LogLevel::Warn,
            log,
        });
    }

    pub fn error(&self, log: LogObject) {
        self.log(LogObjectWithLevel {
            level: LogLevel::Error,
            log,
        });
    }

    pub fn debug(&self, log: LogObject) {
        self.log(LogObjectWithLevel {
            level: LogLevel::Debug,
            log,
        });
    }
}

// Sleep until the given instant
async fn sleep_until(deadline: Instant) {
    let now = Instant::now();
    if deadline > now {
        sleep(deadline - now).await;
    }
}

impl Default for LogObject {
    fn default() -> LogObject {
        LogObject {
            data: None,
            error: None,
            message: "".to_string(),
            _time: get_current_time(OffsetDateTime::now_utc()),
        }
    }
}
