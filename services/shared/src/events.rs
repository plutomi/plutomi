use std::str::FromStr;

#[derive(Debug)]
pub enum PlutomiEvents {
    TOTPRequested,
}

impl FromStr for PlutomiEvents {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "events.totp.requested" => Ok(PlutomiEvents::TOTPRequested),
            _ => Err(()),
        }
    }
}

pub const EVENT_STREAM_NAME: &str = "events";

impl PlutomiEvents {
    pub fn as_string(&self) -> String {
        let value = match self {
            PlutomiEvents::TOTPRequested => "events.totp.requested",
        };

        value.to_string()
    }
}
