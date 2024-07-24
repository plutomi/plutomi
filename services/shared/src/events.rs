use std::str::FromStr;

#[derive(Debug)]
pub enum PlutomiEvents {
    TOTPRequested,
    TOTPVerified,
}

impl FromStr for PlutomiEvents {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "totp.requested" => Ok(PlutomiEvents::TOTPRequested),
            "totp.verified" => Ok(PlutomiEvents::TOTPVerified),
            _ => Err(()),
        }
    }
}

pub const EVENT_STREAM_NAME: &str = "EVENTS";
