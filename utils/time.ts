import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";

dayjs.extend(relativeTime);

/**
 * @param format - `iso`, `unix`, or `plain` date object
 */
export function GetCurrentTime(format: "iso" | "unix") {
  if (format === "iso") return dayjs().toISOString();
  if (format === "unix") return dayjs().unix();
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
  format: "iso" | "unix"
) {
  if (when === "future") {
    const newTime = dayjs().add(amount, type);
    if (format === "iso") return newTime.toISOString();
    if (format === "unix") return newTime.unix();
  }

  if (when === "past") {
    const newTime = dayjs().subtract(amount, type);
    if (format === "iso") return newTime.toISOString();
    if (format === "unix") return newTime.unix();
  }
}

export function getRelativeTime(timestamp) {
  return dayjs().to(timestamp);
}
