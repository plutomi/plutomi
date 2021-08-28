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
 * @param format - iso or unix
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
  format: "iso" | "unix"
) {
  if (when === "future") {
    if (format === "iso") return dayjs().add(amount, type).toISOString();
    if (format === "unix") return dayjs().add(amount, type).unix();
  }

  // In the past
  if (format === "iso") return dayjs().subtract(amount, type).toISOString();
  if (format === "unix") return dayjs().subtract(amount, type).unix();
}
