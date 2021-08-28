import dayjs from "dayjs";

/**
 *
 * @param format
 * @returns The current timestamp in the format provided
 */
export function GetCurrentTime(format: "unix" | "iso") {
  const now = dayjs();

  if (format === "unix") {
    return now.unix();
  }

  if (format === "iso") {
    return now.toISOString();
  }
}

/**
 *
 * @param amount - How long in the future? 7, 28, 500
 * @param type - What time measure? seconds, minutes, hours, days, etc
 * @param format - ISO or UNIX
 * @returns A timestamp `in the future` in the format provided
 */
export function GetFutureTime(
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
  const now = dayjs();

  if (format === "iso") {
    return now.add(amount, type).toISOString();
  }

  if (format === "unix") {
    return now.add(amount, type).unix();
  }
}
