use axiom_rs::Client;
use serde_json::json;
use time::OffsetDateTime;
use tokio::sync::mpsc::{self, Sender};

use super::get_env::get_env;

enum LogLevel {
    Info,
    Error,
}

struct LogMessage {
    level: LogLevel,
    message: String,
}

pub struct Logger {
    sender: Sender<LogMessage>,
}

impl Logger {
    pub fn new() -> Self {
        let axiom_client = Client::builder()
            .with_token(&get_env().AXIOM_TOKEN)
            .with_org_id(&get_env().AXIOM_ORG_ID)
            .build()
            .unwrap();

        let (sender, mut receiver) = mpsc::channel::<LogMessage>(500);

        // Spawn the logging thread
        tokio::spawn(async move {
            while let Some(log) = receiver.recv().await {
                match log.level {
                    LogLevel::Info => {
                        axiom_client
                            .ingest(
                                &get_env().AXIOM_DATASET,
                                vec![json!({
                                    "foo":  log.message,
                                })],
                            )
                            .await
                            .unwrap();

                        let now = OffsetDateTime::now_utc();

                        println!("{} INFO: {}", now, log.message)
                    }

                    LogLevel::Error => eprintln!("ERROR: {}", log.message), // Replace with Axiom client logic
                }
            }
        });

        Logger { sender }
    }
    pub fn info(&self, message: String) {
        let sender = self.sender.clone();
        tokio::spawn(async move {
            sender
                .send(LogMessage {
                    level: LogLevel::Info,
                    message,
                    // TODO add json data
                })
                .await
                .expect("Failed to send log message");
        });
    }
}
