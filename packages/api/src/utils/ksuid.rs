/**
 * A lot of this code is from https://github.com/svix/rust-ksuid - MIT Licensed
 *
 * This code removes the regular 1 second implementation and only uses the ms implementation.
 * It also changes the ms granularity from 4ms to 1ms.
 */
use core::fmt;
use std::{error, str::FromStr};

use byteorder::{BigEndian, ByteOrder};
use time::OffsetDateTime;

#[cfg(feature = "serde")]
use serde::de::{self, Deserialize, Deserializer, Visitor};
#[cfg(feature = "serde")]
use serde::ser::{Serialize, Serializer};

pub const KSUID_EPOCH: i64 = 1_400_000_000;

const BASE_62_CHARS: &[u8; 62] = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const TOTAL_BYTES: usize = 20;

#[derive(Debug)]
pub struct Error(String);

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        self.0.fmt(f)
    }
}

impl error::Error for Error {
    fn source(&self) -> Option<&(dyn error::Error + 'static)> {
        None
    }
}

fn timestamp_millis(dt: &OffsetDateTime) -> i64 {
    (dt.unix_timestamp_nanos() / 1_000_000) as i64
}

pub trait KsuidLike {
    /// The type of the Ksuid struct beind implemented
    type Type;

    /// The number of bytes used for timestamp (`TIMESTAMP_BYTES + PAYLOAD_BYTES == 20`)
    const TIMESTAMP_BYTES: usize;
    /// The number of bytes used for payload (`TIMESTAMP_BYTES + PAYLOAD_BYTES == 20`)
    const PAYLOAD_BYTES: usize;

    fn new(timestamp: Option<OffsetDateTime>, payload: Option<&[u8]>) -> Self::Type;

    fn from_seconds(timestamp: Option<i64>, payload: Option<&[u8]>) -> Self::Type;

    fn timestamp(&self) -> OffsetDateTime;

    fn timestamp_seconds(&self) -> i64 {
        self.timestamp().unix_timestamp()
    }

    fn payload(&self) -> &[u8] {
        &self.bytes()[Self::TIMESTAMP_BYTES..]
    }

    fn from_bytes(bytes: [u8; TOTAL_BYTES]) -> Self::Type;

    fn bytes(&self) -> &[u8; TOTAL_BYTES];

    fn to_base62(&self) -> String {
        format!(
            "{:0>27}",
            base_encode::to_string(self.bytes(), 62, BASE_62_CHARS).unwrap()
        )
    }

    fn from_base62(s: &str) -> Result<Self::Type, Error> {
        if let Some(loaded) = base_encode::from_str(s, 62, BASE_62_CHARS) {
            // Get the last TOTAL_BYTES
            let loaded = if loaded.len() > TOTAL_BYTES {
                &loaded[loaded.len() - TOTAL_BYTES..]
            } else {
                &loaded[..]
            };
            let mut buf = [0u8; TOTAL_BYTES];
            if loaded.len() != TOTAL_BYTES {
                Err(Error(format!(
                    "Got ksuid of unexpected length {}",
                    loaded.len()
                )))
            } else {
                buf.copy_from_slice(loaded);
                Ok(Self::from_bytes(buf))
            }
        } else {
            Err(Error("Failed to decode".to_owned()))
        }
    }
}

#[derive(Debug, PartialOrd, Ord, Clone, Copy, PartialEq, Eq)]
pub struct KsuidMs([u8; TOTAL_BYTES]);
impl KsuidMs {
    const U64_BYTES: usize = 8;

    pub fn new_raw(timestamp: u64, payload: Option<&[u8]>) -> Self {
        let mut buf = [0u8; TOTAL_BYTES];
        let mut timestamp_buf = [0u8; Self::U64_BYTES];
        BigEndian::write_u64(&mut timestamp_buf, timestamp);
        // We only want the TIMESTAMP_BYTES least significant bytes
        // OLD:
        // buf[..Self::TIMESTAMP_BYTES].copy_from_slice(
        //     &timestamp_buf[Self::U64_BYTES - Self::TIMESTAMP_BYTES..Self::U64_BYTES],
        // );
        buf[..Self::TIMESTAMP_BYTES]
            .copy_from_slice(&timestamp_buf[Self::U64_BYTES - Self::TIMESTAMP_BYTES..]);
        if let Some(payload) = payload {
            buf[Self::TIMESTAMP_BYTES..].copy_from_slice(payload);
        } else {
            getrandom::getrandom(&mut buf[Self::TIMESTAMP_BYTES..]).unwrap();
        }
        Self::from_bytes(buf)
    }

    pub fn from_millis(timestamp: Option<i64>, payload: Option<&[u8]>) -> Self {
        let timestamp_ms =
            timestamp.unwrap_or_else(|| timestamp_millis(&OffsetDateTime::now_utc()));
        let timestamp_s = (timestamp_ms / 1_000) - KSUID_EPOCH;
        let timestamp_ms = timestamp_ms % 1_000;
        // OLD:
        // let timestamp: i64 = ((timestamp_s << 8) & 0xFFFFFFFF00) | timestamp_ms;
        let timestamp = (timestamp_s << 10) | timestamp_ms;

        Self::new_raw(timestamp as u64, payload)
    }

    pub fn timestamp_millis(&self) -> i64 {
        timestamp_millis(&self.timestamp())
    }

    pub fn timestamp_raw(&self) -> u64 {
        // Remove two bytes from the result (as we are only u48, not u64, and then mask the result)
        // OLD:
        // BigEndian::read_u64(self.bytes()) >> ((Self::U64_BYTES - Self::TIMESTAMP_BYTES) * 8)
        BigEndian::read_u64(self.bytes()) >> ((Self::U64_BYTES - Self::TIMESTAMP_BYTES) * 8)
    }
}

impl KsuidLike for KsuidMs {
    type Type = KsuidMs;
    const TIMESTAMP_BYTES: usize = 6;
    const PAYLOAD_BYTES: usize = 14;

    fn new(timestamp: Option<OffsetDateTime>, payload: Option<&[u8]>) -> Self {
        let timestamp = timestamp.map(|x| timestamp_millis(&x));
        Self::from_millis(timestamp, payload)
    }

    fn from_seconds(timestamp: Option<i64>, payload: Option<&[u8]>) -> Self {
        let timestamp = timestamp.map(|x| x * 1_000);
        Self::from_millis(timestamp, payload)
    }

    fn from_bytes(bytes: [u8; TOTAL_BYTES]) -> Self {
        Self(bytes)
    }

    fn bytes(&self) -> &[u8; TOTAL_BYTES] {
        &self.0
    }

    fn timestamp(&self) -> OffsetDateTime {
        let timestamp = self.timestamp_raw() as i64;
        // OLD:
        // let seconds = ((timestamp >> 8) + KSUID_EPOCH) as i128;
        // let ns = (1_000_000 * (((timestamp & 0xFF) << 2) % 1_000)) as i128;

        let seconds = ((timestamp >> 10) + KSUID_EPOCH) as i128;
        let ns = (1_000_000 * (timestamp & 0x3FF)) as i128;

        OffsetDateTime::from_unix_timestamp_nanos(seconds * 1_000_000_000 + ns).unwrap()
    }
}

impl FromStr for KsuidMs {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::from_base62(s)
    }
}

impl fmt::Display for KsuidMs {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_base62())
    }
}
