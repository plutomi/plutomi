use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct Error {
    pub response: String,
    pub text: String,
}

impl Error {
    pub fn new(text: &str) -> Self {
        Self {
            response: "ERROR".to_string(),
            text: text.to_string(),
        }
    }
}
