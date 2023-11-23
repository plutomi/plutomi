use std::env;

#[allow(non_snake_case)]
pub struct Env {
    pub API_KEY: String,
}

pub fn get_env() -> Env {
    for (key, value) in env::vars() {
        println!("{}: {}", key, value);
    }

    Env {
        API_KEY: env::var("API_KEY").expect("API_KEY must be set"),
    }
}
