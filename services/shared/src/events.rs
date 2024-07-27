use std::str::FromStr;

#[derive(Debug)]
pub enum PlutomiEvents {
    TOTPRequested,
}

impl FromStr for PlutomiEvents {
    type Err = ();
    /**
     * Given a string from a message, convert it to a PlutomiEvents enum
     */
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "events.totp.requested" => Ok(PlutomiEvents::TOTPRequested),
            _ => Err(()),
        }
    }
}

impl PlutomiEvents {
    /**
     * Convert the PlutomiEvents enum to a string
     */
    pub fn as_string(&self) -> String {
        let value = match self {
            PlutomiEvents::TOTPRequested => "events.totp.requested",
        };

        value.to_string()
    }
}
