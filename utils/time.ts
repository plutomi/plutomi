import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
dayjs.extend(relativeTime);

/**
 * Gets the current ISO timestamp
 * @returns The current ISO timestamp
 */
export const currentISO = () => dayjs().toISOString();

/**
 * Gets the current UNIX timestamp
 * @returns The current UNIX timestamp
 */
export const currentUNIX = () => dayjs().unix();

/**
 * Returns a string with the relative time to the date provided
 * @param date  The date (in any format) to use
 * @returns A string such as '23 days ago' relative to the passed in date
 * @external String
 * @see The DayJS documentation for more info https://day.js.org/docs/en/plugin/relative-time
 */
export const relative = (date: string | number | Date): string => {
  try {
    let convertedDate = dayjs(date).toDate();
    return dayjs().to(convertedDate);
  } catch (error) {
    throw `The date you provided appears to be invalid`;
  }
};

/**
 *
 * @param amount *Amount* of {@link TIME_UNITS} to get in the future
 * @param unit Which {@link TIME_UNITS} to retrieve
 * @returns A future ISO timestamp
 */
export const futureISO = (amount: number, unit: string) => dayjs().add(amount, unit).toISOString();

/**
 *
 * @param amount *Amount* of {@link TIME_UNITS} to get in the future
 * @param unit Which {@link TIME_UNITS} to retrieve
 * @returns A future UNIX timestamp
 */

export const futureUNIX = (amount: number, unit: string): number => {
  return dayjs().add(amount, unit).unix();
};

/**
 *
 * @param amount *Amount* of {@link TIME_UNITS} to get in the past
 * @param unit Which {@link TIME_UNITS} to retrieve
 * @returns A past ISO timestamp
 */

export const pastISO = (amount: number, unit: string): string => {
  return dayjs().subtract(amount, unit).toISOString();
};

export const pastUNIX = (amount: number, unit: string): number => {
  /**
   *
   * @param amount *Amount* of {@link TIME_UNITS} to get in the past
   * @param unit Which {@link TIME_UNITS} to retrieve
   * @returns A past UNIX timestamp
   */
  return dayjs().subtract(amount, unit).unix();
};
