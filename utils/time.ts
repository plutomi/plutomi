import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { TimeUnits } from "../types";
dayjs.extend(relativeTime);
import { INVALID_DATE_ERROR } from "../Config";

/**
 * Wrapper around dayjs for the most common use cases
 */
export default class Time {
  /**
   * Gets the current ISO timestamp
   * @returns The current ISO timestamp
   */
  static currentISO(): string {
    return dayjs().toISOString();
  }

  /**
   * Gets the current UNIX timestamp
   * @returns The current UNIX timestamp
   */

  static currentUNIX(): number {
    return dayjs().unix();
  }

  /**
   *
   * @param timestamp  The date to get a relative time to
   * @returns A string such as '23 days ago' relative to the passed in date
   * @external String
   * @see The DayJS documentation for more info https://day.js.org/docs/en/plugin/relative-time
   */
  static relative(timestamp: Date): string {
    if (!dayjs(timestamp).isValid()) {
      throw INVALID_DATE_ERROR;
    }
    return dayjs().to(timestamp);
  }

  /**
   *
   * @param amount *Amount* of {@link TimeUnits} to get in the future
   * @param unit Which {@link TimeUnits} to retrieve
   * @returns A future ISO timestamp
   */
  static futureISO(amount: number, unit: TimeUnits): string {
    return dayjs().add(amount, unit).toISOString();
  }

  /**
   *
   * @param amount *Amount* of {@link TimeUnits} to get in the future
   * @param unit Which {@link TimeUnits} to retrieve
   * @returns A future UNIX timestamp
   */
  static futureUNIX(amount: number, unit: TimeUnits): number {
    return dayjs().add(amount, unit).unix();
  }

  /**
   *
   * @param amount *Amount* of {@link TimeUnits} to get in the past
   * @param unit Which {@link TimeUnits} to retrieve
   * @returns A past ISO timestamp
   */
  static pastISO(amount: number, unit: TimeUnits): string {
    return dayjs().add(amount, unit).toISOString();
  }

  /**
   *
   * @param amount *Amount* of {@link TimeUnits} to get in the past
   * @param unit Which {@link TimeUnits} to retrieve
   * @returns A past UNIX timestamp
   */
  static pastUNIX(amount: number, unit: TimeUnits): number {
    return dayjs().add(amount, unit).unix();
  }
}
