import dayjs from "dayjs";

/**
 * @param format - `iso`, `unix`, or `plain` date object
 */
export function GetCurrentTime(format: "iso" | "unix" | "plain") {
  if (format === "iso") return dayjs().toISOString();
  if (format === "unix") return dayjs().unix();
  if (format === "plain") return dayjs();
}

/**
 *
 * @param amount - How long in the future? This is the actual number value
 * @param type - What time measure? seconds, minutes, hours, days, etc
 * @param format - iso, unix or plain date object
 */
export function GetPastOrFutureTime(
  when: "past" | "future",
  amount: number,
  type:
    | "milliseconds"
    | "seconds"
    | "minutes"
    | "hours"
    | "days"
    | "weeks"
    | "months"
    | "years",
  format: "iso" | "unix" | "plain"
) {
  if (when === "future") {
    const new_time = dayjs().add(amount, type);
    if (format === "iso") return new_time.toISOString();
    if (format === "unix") return new_time.unix();
    if (format === "plain") return new_time.toDate();
  }

  // In the past
  if (when === "past") {
    const new_time = dayjs().subtract(amount, type);
    if (format === "iso") return new_time.toISOString();
    if (format === "unix") return new_time.unix();
    if (format === "plain") return new_time.toDate();
  }
}
