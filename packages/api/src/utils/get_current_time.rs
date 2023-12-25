use time::{macros::format_description, OffsetDateTime};

pub fn iso_format(time: OffsetDateTime) -> String {
    // Define the format for the main part of the timestamp
    let format = format_description!("[year]-[month]-[day]T[hour]:[minute]:[second]");

    let formatted = time.format(&format).expect("Timestamp formatting failed");

    // Get the milliseconds and format them with three decimal places
    let milliseconds = time.millisecond();
    format!("{}.{:03}Z", formatted, milliseconds)
}
