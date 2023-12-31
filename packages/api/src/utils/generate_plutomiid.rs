use byteorder::{BigEndian, ByteOrder};
use std::fmt;
use time::OffsetDateTime;

// Similar to KSUID - prefix_[48 bit timestamp][14 bit random payload]
const TIMESTAMP_BYTES: usize = 6; // 48 bits for timestamp
const TOTAL_BYTES: usize = 20; // Total bytes
                               // const PAYLOAD_BYTES: usize = 14; - Not being used, but should match to TOTAL_BYTES - TIMESTAMP_BYTES

pub const KSUID_EPOCH: i64 = 1_600_000_000; // Custom KSUID epoch
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
    Response,
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
            Entities::Response => "res_",
        };

        prefix.to_string()
    }
}

impl PlutomiId {
    // Creates a new PlutomiId with the specified OffsetDateTime
    pub fn new(datetime: OffsetDateTime, entity: Entities) -> String {
        let timestamp_since_epoch = datetime.unix_timestamp() - KSUID_EPOCH;
        let timestamp_s: u64 = timestamp_since_epoch as u64;
        let timestamp_ms = (datetime.nanosecond() / 1_000_000) as u64;
        let timestamp = (timestamp_s << 10) | timestamp_ms; // Encoding seconds and milliseconds

        let mut buf = [0u8; TOTAL_BYTES];
        BigEndian::write_u48(&mut buf, timestamp); // Write 48-bit timestamp
        getrandom::getrandom(&mut buf[TIMESTAMP_BYTES..]).unwrap(); // Random payload

        // user_2a2pyd9xkCALnkGwHzU1MkAza
        entity.to_prefix() + &PlutomiId(buf).to_base62()
    }
}

impl PlutomiId {
    // Convert the PlutomiId to a Base62 encoded string
    pub fn to_base62(&self) -> String {
        base_encode::to_string(&self.0, 62, BASE62_CHARS).unwrap()
    }
}
