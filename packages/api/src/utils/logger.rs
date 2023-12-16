use super::get_env::get_env;
use axiom_rs::Client;
use serde_json::json;
use time::OffsetDateTime;
use tokio::sync::mpsc::{self, Sender};
use tracing::{debug, error, info, warn, Level};
use tracing_subscriber::FmtSubscriber;

enum LogLevel {
    Info,
    Error,
    Debug,
    Warn,
}

struct LogMessage {
    level: LogLevel,
    message: String,
}

pub struct Logger {
    sender: Sender<LogMessage>,
    axiom_client: Option<Client>, // Optional Axiom client
}

impl Logger {
    pub fn new(use_axiom: bool) -> Self {
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
            .with_max_level(Level::DEBUG) // Adjust the log level as needed
            .finish();

        tracing::subscriber::set_global_default(subscriber)
            .expect("setting default subscriber failed");

        let (sender, mut receiver) = mpsc::channel::<LogMessage>(500);

        // Spawn the logging thread
        let client_clone = axiom_client.clone();
        tokio::spawn(async move {
            while let Some(log) = receiver.recv().await {
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
                        error!("{}", log.message); // Tracing error logging
                    }

                    LogLevel::Debug => {
                        debug!("{}", log.message); // Tracing debug logging
                    }
                    LogLevel::Warn => {
                        warn!("{}", log.message); // Tracing debug logging
                    }
                }
            }
        });

        return Logger {
            sender,
            axiom_client,
        };
    }

    fn log(&self, level: LogLevel, message: String) {
        let sender = self.sender.clone();
        tokio::spawn(async move {
            if sender.send(LogMessage { level, message }).await.is_err() {
                eprintln!("Failed to enqueue log message");
            }
        });
    }

    pub fn info(&self, message: String) {
        self.log(LogLevel::Info, message);
    }

    pub fn warn(&self, message: String) {
        self.log(LogLevel::Warn, message);
    }

    pub fn error(&self, message: String) {
        self.log(LogLevel::Error, message);
    }

    pub fn debug(&self, message: String) {
        self.log(LogLevel::Debug, message);
    }
}
