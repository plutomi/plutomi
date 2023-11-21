// use byteorder::{BigEndian, ByteOrder};
// use rand::Rng;
// use time::OffsetDateTime;

// // Add the appropriate crate for base62 encoding here
// use base62; // Make sure this crate is included in your Cargo.toml

// const CUSTOM_EPOCH: i64 = 1_600_000_000;
// const TOTAL_BYTES: usize = 20;
// const TIMESTAMP_BYTES: usize = 6;
// const PAYLOAD_BYTES: usize = TOTAL_BYTES - TIMESTAMP_BYTES;
// const BASE_62_CHARS: &[u8; 62] = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// enum EntityType {
//     User,
//     Org,
// }

// impl EntityType {
//     fn prefix(&self) -> &str {
//         match self {
//             EntityType::User => "user_",
//             EntityType::Org => "org_",
//         }
//     }
// }

// fn timestamp_millis() -> u64 {
//     let now = OffsetDateTime::now_utc();
//     let timestamp_s = (now.unix_timestamp() - CUSTOM_EPOCH) as u64;
//     let timestamp_ms = now.millisecond() as u64;
//     (timestamp_s << 10) | timestamp_ms // 38 bits for seconds, 10 bits for milliseconds
// }

// pub fn generate_ksuid(entity_type: EntityType) -> String {
//     let mut rng = rand::thread_rng();
//     let mut ksuid = [0u8; TOTAL_BYTES];

//     // Timestamp (6 bytes)
//     BigEndian::write_u48(&mut ksuid[0..TIMESTAMP_BYTES], timestamp_millis());

//     // Random payload (14 bytes)
//     rng.fill(&mut ksuid[TIMESTAMP_BYTES..]);

//     // Base62 encoding
//     let base62_encoded = base62::encode(&ksuid);

//     format!("{}{}", entity_type.prefix(), base62_encoded)
// }

// fn main() {
//     let user_ksuid = generate_ksuid(EntityType::User);
//     let org_ksuid = generate_ksuid(EntityType::Org);

//     println!("User KSUID: {}", user_ksuid);
//     println!("Organization KSUID: {}", org_ksuid);
// }
