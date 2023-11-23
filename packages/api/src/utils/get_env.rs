use std::env;

#[allow(non_snake_case)]
pub struct Env {
    pub DATABASE_URL: String,
}

pub fn get_env() -> Env {
    Env {
        DATABASE_URL: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
    }
}
