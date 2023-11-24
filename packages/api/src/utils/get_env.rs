use std::env;

#[allow(non_snake_case)]
pub struct Env {
    pub DATABASE_URL: String,
    pub BASE_URL: String,
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
        BASE_URL: get_key_from_env("BASE_URL"),
    }
}
