use crate::env::get_env;

pub async fn health_check() -> String {
    let env = get_env();

    format!("Hello from rust :D {}", env.API_KEY)
}
