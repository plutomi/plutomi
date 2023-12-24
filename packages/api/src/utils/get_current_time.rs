use time::{macros::format_description, OffsetDateTime};

pub fn get_current_time() -> String {
    // Define the format for the main part of the timestamp
    let format = format_description!("[year]-[month]-[day]T[hour]:[minute]:[second]ZZZZZ");

    let now = OffsetDateTime::now_utc();
    let formatted = now.format(&format).expect("Timestamp formatting failed");

    // Get the milliseconds and format them with three decimal places
    let milliseconds = now.millisecond();
    format!("{}.{:03}Z", formatted, milliseconds)
}
