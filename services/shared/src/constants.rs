use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub enum Topics {
    // Used for debugging
    Test,
    TestRetry,
    TestDLQ,
}

impl Topics {
    // Convert the enum variant to a string (as Kafka requires topic names as strings)
    pub fn as_str(&self) -> &'static str {
        match self {
            // Used for debugging
            Topics::Test => "test",
            Topics::TestRetry => "test-retry",
            Topics::TestDLQ => "test-dlq",
        }
    }
}

impl From<&str> for Topics {
    fn from(topic: &str) -> Self {
        match topic {
            // Used for debugging
            "test" => Topics::Test,
            "test-retry" => Topics::TestRetry,
            "test-dlq" => Topics::TestDLQ,
            _ => panic!("Invalid topic: {}", topic), // Panics for invalid topics
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
