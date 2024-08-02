use std::env;

use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Env {
    pub MONGODB_URL: String,
    pub BASE_WEB_URL: String,
    pub ENVIRONMENT: String,
    pub NATS_URL: String,
    pub AXIOM_DATASET: Option<String>,
    pub AXIOM_TOKEN: Option<String>,
    pub AXIOM_ORG_ID: Option<String>,
}

impl Env {
    // Used in logger.rs
    pub fn axiom_configured(&self) -> bool {
        self.AXIOM_DATASET.is_some() && self.AXIOM_TOKEN.is_some() && self.AXIOM_ORG_ID.is_some()
    }
}

// Panic if key is not found in env and no default_value is provided
fn get_key_from_env(key: &str, default_value: Option<&str>) -> String {
    env::var(key).unwrap_or_else(|e| {
        default_value.map(|v| v.to_string()).unwrap_or_else(|| {
            panic!(
                "Error getting key '{}' from env: {} and no default_value provided",
                key, e
            )
        })
    })
}

// Return None if key is not found in env
fn get_optional_key_from_env(key: &str) -> Option<String> {
    env::var(key).ok()
}

fn build_nats_url() -> String {
    let nats_username = get_key_from_env("NATS_USERNAME", Some("admin"));
    let nats_password = get_key_from_env("NATS_PASSWORD", Some("password"));
    let nats_host = get_key_from_env("NATS_HOST", Some("localhost"));
    let nats_port = get_key_from_env("NATS_PORT", Some("4222"));

    format!(
        "nats://{}:{}@{}:{}",
        nats_username, nats_password, nats_host, nats_port
    )
}
pub fn get_env() -> Env {
    Env {
        // Required
        MONGODB_URL: get_key_from_env("MONGODB_URL", None),
        ENVIRONMENT: get_key_from_env("ENVIRONMENT", Some("development")),
        BASE_WEB_URL: get_key_from_env("BASE_WEB_URL", Some("http://localhost:3000")),
        NATS_URL: build_nats_url(),
        AXIOM_DATASET: get_optional_key_from_env("AXIOM_DATASET"),
        AXIOM_TOKEN: get_optional_key_from_env("AXIOM_TOKEN"),
        AXIOM_ORG_ID: get_optional_key_from_env("AXIOM_ORG_ID"),
    }
}
