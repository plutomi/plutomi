use byteorder::{BigEndian, ByteOrder};
use time::OffsetDateTime;

// prefix_[48 bit timestamp][80 bit random payload]
const TIMESTAMP_BYTES: usize = 6; // 48 bits for timestamp
const TOTAL_BYTES: usize = 16; // 128 bits total

const CUSTOM_EPOCH: i64 = 1_700_000_000;
const BASE62_CHARS: &[u8] = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

#[derive(Debug, PartialOrd, Ord, Clone, Copy, PartialEq, Eq)]
pub struct PlutomiId([u8; TOTAL_BYTES]);

pub enum Entities {
    User,
    Org,
    Membership,
    Workspace,
    Invite,
    Application,
    Stage,
    Request,
}
impl Entities {
    fn to_prefix(&self) -> String {
        let prefix = match self {
            Entities::User => "user_",
            Entities::Org => "org_",
            Entities::Membership => "membership_",
            Entities::Workspace => "workspace_",
            Entities::Invite => "invite_",
            Entities::Application => "application_",
            Entities::Stage => "stage_",
            Entities::Request => "req_",
        };

        prefix.to_string()
    }
}

impl PlutomiId {
    // Creates a new PlutomiId with the specified OffsetDateTime
    pub fn new(datetime: &OffsetDateTime, entity: Entities) -> String {
        // Calculate the number of milliseconds since a custom epoch
        // This extends the useful life by ~2024 years
        // The 48 bit timestamp allows for 281,474,976,710,656 milliseconds which is ~8,921 years of useful life
        let seconds_since_epoch: u64 = (datetime.unix_timestamp() - CUSTOM_EPOCH) as u64;
        let milliseconds_since_epoch = seconds_since_epoch * 1000 + datetime.millisecond() as u64;

        // Initialize a buffer to hold the total bytes of the PlutomiId
        let mut buf = [0u8; TOTAL_BYTES];

        // Write the 48-bit timestamp into the first 6 bytes of the buffer
        BigEndian::write_u48(&mut buf, milliseconds_since_epoch);

        // Fill the remaining bytes in the buffer with random data for the payload
        getrandom::getrandom(&mut buf[TIMESTAMP_BYTES..]).unwrap();

        // Combine the entity prefix with the base62 encoded PlutomiId
        // req_0021J7zl6n38lTB2TwiTkIIQ9KF
        entity.to_prefix() + &PlutomiId(buf).to_base62()
    }
}

impl PlutomiId {
    // Convert the PlutomiId to a Base62 encoded string
    pub fn to_base62(&self) -> String {
        base_encode::to_string(&self.0, 62, BASE62_CHARS).unwrap()
    }
}
