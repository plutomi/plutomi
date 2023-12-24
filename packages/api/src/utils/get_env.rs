use std::env;

#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Env {
    pub DATABASE_URL: String,
    pub NEXT_PUBLIC_BASE_URL: String,
    pub NEXT_PUBLIC_ENVIRONMENT: String,
    pub AXIOM_DATASET: String,
    pub AXIOM_TOKEN: String,
    pub AXIOM_ORG_ID: String,
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
        NEXT_PUBLIC_BASE_URL: get_key_from_env("NEXT_PUBLIC_BASE_URL"),
        NEXT_PUBLIC_ENVIRONMENT: get_key_from_env("NEXT_PUBLIC_ENVIRONMENT"),
        AXIOM_DATASET: get_key_from_env("AXIOM_DATASET"),
        AXIOM_TOKEN: get_key_from_env("AXIOM_TOKEN"),
        AXIOM_ORG_ID: get_key_from_env("AXIOM_ORG_ID"),
    }
}
