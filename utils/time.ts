import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";

dayjs.extend(relativeTime);

/**
 * @param format - `iso`, `unix`, or `plain` date object
 */
export function getCurrentTime(format: "iso" | "unix") {
  if (format === "iso") return dayjs().toISOString();
  if (format === "unix") return dayjs().unix();
}

/**
 *
 * @param amount - How long in the future? This is the actual number value
 * @param type - What time measure? seconds, minutes, hours, days, etc
 * @param format - iso, unix or plain date object
 */
export function getPastOrFutureTime(
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
    const new_time = dayjs().add(amount, type);
    if (format === "iso") return new_time.toISOString();
    if (format === "unix") return new_time.unix();
  }

  if (when === "past") {
    const new_time = dayjs().subtract(amount, type);
    if (format === "iso") return new_time.toISOString();
    if (format === "unix") return new_time.unix();
  }
}

export function getRelativeTime(timestamp) {
  return dayjs().to(timestamp);
}
