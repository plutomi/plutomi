use std::fmt;
use std::str::FromStr;

#[derive(Debug)]
enum Events {
    TOTPRequested,
    TOTPVerified,
}

impl fmt::Display for Events {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}",
            match self {
                Events::TOTPRequested => "totp.requested",
                Events::TOTPVerified => "totp.verified",
            }
        )
    }
}

impl FromStr for Events {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "totp.requested" => Ok(Events::TOTPRequested),
            "totp.verified" => Ok(Events::TOTPVerified),

            _ => Err(()),
        }
    }
}
