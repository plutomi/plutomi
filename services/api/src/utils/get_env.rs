use std::env;

use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize, Debug)]
#[allow(non_snake_case)]
pub struct Env {
    pub DATABASE_URL: String,
    pub BASE_WEB_URL: String,
    pub ENVIRONMENT: String,
}

fn get_key_from_env(key: &str) -> String {
    match env::var(key) {
        Ok(val) => val,
        Err(e) => {
            // TODO: Log error
            panic!("Error getting key '{}' from env: {}", key, e)
        }
    }
}

pub fn get_env() -> Env {
    Env {
        DATABASE_URL: get_key_from_env("DATABASE_URL"),
        BASE_WEB_URL: get_key_from_env("BASE_WEB_URL"),
        ENVIRONMENT: get_key_from_env("ENVIRONMENT"),
    }
}
