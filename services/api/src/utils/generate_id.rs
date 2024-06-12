use byteorder::{BigEndian, ByteOrder};
use rand::{thread_rng, Rng};
use time::OffsetDateTime;

// prefix_[48 bit timestamp][64 bit random payload]
const TIMESTAMP_BYTES: usize = 6; // 48 bits for timestamp
const TOTAL_BYTES: usize = 14; // 112 bits total

const CUSTOM_EPOCH: i64 = 1_713_000_000;
const BASE62_CHARS: &[u8] = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

#[derive(Debug, PartialOrd, Ord, Clone, Copy, PartialEq, Eq)]
pub struct PlutomiId([u8; TOTAL_BYTES]);

pub enum Entities {
    // User,
    // Org,
    // Membership,
    // Workspace,
    // Invite,
    // Application,
    // Stage,
    // We don't need a `Response` entity because Responses will
    // have the Request + ID so for any debugging purposes, we can retrieve
    // everything for a request including the response, by using the Request ID
    Request,
    // Webhook,
    // ApiKey,
    // Response,
    // Note,
}
impl Entities {
    fn as_prefix(&self) -> String {
        let prefix = match self {
            // Entities::User => "usr_",
            // Entities::Org => "org_",
            // Entities::Membership => "mbr_",
            // Entities::Workspace => "wsp_",
            // Entities::Invite => "inv_",
            // Entities::Note => "nte_",
            // Entities::Application => "app_",
            // Entities::Stage => "stg_",
            Entities::Request => "rq_",
            // Entities::Response => "rs_",
            // Entities::Webhook => "whk_",
            // Entities::ApiKey => "plutomi_api_key_",
        };

        prefix.to_string()
    }
}

impl PlutomiId {
    // Creates a new PlutomiId with the specified OffsetDateTime. Use OffsetDateTime::now_utc():
    pub fn new(datetime: &OffsetDateTime, entity: Entities) -> String {
        // The 48 bit timestamp allows for 281,474,976,710,656 milliseconds which is ~8,921 years of useful life
        // We calculate the number of milliseconds since the custom epoch, this extends the useful life by another ~2024 years
        let seconds_since_epoch: u64 = (datetime.unix_timestamp() - CUSTOM_EPOCH) as u64;
        let milliseconds_since_epoch = seconds_since_epoch * 1000 + datetime.millisecond() as u64;

        // Initialize a buffer to hold the total bytes of the PlutomiId
        let mut buf = [0u8; TOTAL_BYTES];

        // Write the 48-bit timestamp into the first 6 bytes of the buffer
        BigEndian::write_u48(&mut buf, milliseconds_since_epoch);

        // Fill the remaining bytes in the buffer with random data for the payload
        // thread_rng is much faster than getrandom
        thread_rng().fill(&mut buf[TIMESTAMP_BYTES..]);

        // Combine the entity prefix with the base62 encoded PlutomiId
        // req_0021J7zl6n38lTB2TwiTkIIQ9KF
        entity.as_prefix() + &PlutomiId(buf).to_base62()
    }
}

impl PlutomiId {
    // Convert the PlutomiId to a Base62 encoded string
    pub fn to_base62(&self) -> String {
        base_encode::to_string(&self.0, 62, BASE62_CHARS).unwrap()
    }
}
