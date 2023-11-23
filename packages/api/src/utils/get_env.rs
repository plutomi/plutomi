use std::env;

#[allow(non_snake_case)]
pub struct Env {
    pub DATABASE_URL: String,
}

fn get_key_from_env(key: &str) -> String {
    env::var(key).unwrap_or_else(|e| {
        panic!("Error getting {} from environment: {}", key, e);
    })
}

pub fn get_env() -> Env {
    Env {
        DATABASE_URL: get_key_from_env("DATABASE_URL"),
    }
}
