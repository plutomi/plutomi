use crate::constants::ID_ALPHABET;
use crate::serializers::serialize_naive_datetime_as_utc;
use ::serde::Serialize;
use chrono::{NaiveDateTime, Utc};
use nanoid::nanoid;
use serde::Deserialize;

#[derive(Serialize, Debug, Deserialize, Clone)]
pub struct User {
    // Hide on the way out
    #[serde(skip_serializing)]
    pub id: i64,

    #[serde(rename = "id")]
    pub public_id: String,
    #[serde(serialize_with = "serialize_naive_datetime_as_utc")]
    pub created_at: NaiveDateTime,
    #[serde(serialize_with = "serialize_naive_datetime_as_utc")]
    pub updated_at: NaiveDateTime,

    pub first_name: String,
    pub last_name: String,
    pub email: String,
}

#[derive(Serialize, Debug, Deserialize, Clone)]
pub struct KafkaUser {
    // keep ID
    pub id: i64,
    // Don't rename
    pub public_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,

    pub first_name: String,
    pub last_name: String,
    pub email: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct CreateUserOptions {
    first_name: String,
    last_name: String,
    email: String,
}

impl User {
    pub fn new(options: CreateUserOptions) -> Self {
        let now = Utc::now().naive_utc();
        User {
            id: 0, // Placeholder

            first_name: options.first_name,
            last_name: options.last_name,
            email: options.email,
            public_id: nanoid!(12, &ID_ALPHABET),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn to_kafka(&self) -> KafkaUser {
        KafkaUser {
            id: self.id,
            public_id: self.public_id.clone(),
            created_at: self.created_at,
            updated_at: self.updated_at,
            first_name: self.first_name.clone(),
            last_name: self.last_name.clone(),
            email: self.email.clone(),
        }
    }
}
