/**
 * ! If you add / modify topics here, make sure to update the docker-compose.yaml file to include the topic in the Kafka setup
 */
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub enum Topics {
    // Used for debugging
    Auth,
    AuthRetry,
    AuthDLQ,
}

impl Topics {
    // Convert the enum variant to a string (as Kafka requires topic names as strings)
    pub fn as_str(&self) -> &'static str {
        match self {
            // Used for debugging
            Topics::Auth => "auth",
            Topics::AuthRetry => "auth-retry",
            Topics::AuthDLQ => "auth-dlq",
        }
    }
}

impl From<&str> for Topics {
    fn from(topic: &str) -> Self {
        match topic {
            // Used for debugging
            "auth" => Topics::Auth,
            "auth-retry" => Topics::AuthRetry,
            "auth-dlq" => Topics::AuthDLQ,
            _ => panic!("Invalid topic: {}", topic),
        }
    }
}

pub enum ConsumerGroups {
    Notifications,
}

impl ConsumerGroups {
    pub fn as_str(&self) -> &'static str {
        match self {
            ConsumerGroups::Notifications => "notifications",
        }
    }
}

pub const ID_ALPHABET: [char; 62] = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
    'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B',
    'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z',
];
