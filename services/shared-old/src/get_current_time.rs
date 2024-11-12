use time::{macros::format_description, OffsetDateTime};

/**
 * Formats a time into an ISO 8601 string
 * Use OffsetDateTime::now_utc() when passing it in
 */
pub fn get_current_time(time: OffsetDateTime) -> String {
    // Define the format for the main part of the timestamp
    let format = format_description!("[year]-[month]-[day]T[hour]:[minute]:[second]");

    let formatted = time.format(&format).expect("Timestamp formatting failed");

    // Get the milliseconds and format them with three decimal places
    let milliseconds = time.millisecond();
    format!("{}.{:03}Z", formatted, milliseconds)
}
