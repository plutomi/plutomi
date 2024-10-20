use chrono::{DateTime, NaiveDateTime, Utc};
use serde::Serializer;

/**
 * On the way out from the API, take the MySQL datetime and serialize it as an RFC3339 string (with the Z at the end)
 */
pub fn serialize_naive_datetime_as_utc<S>(
    value: &NaiveDateTime,
    serializer: S,
) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let datetime_utc: DateTime<Utc> = DateTime::from_naive_utc_and_offset(*value, Utc);
    serializer.serialize_str(&datetime_utc.to_rfc3339_opts(chrono::SecondsFormat::Millis, true))
}
