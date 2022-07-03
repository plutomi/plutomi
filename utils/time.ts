import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { TIME_UNITS } from '../Config';

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
    const convertedDate = dayjs(date).toDate();
    return dayjs().to(convertedDate);
  } catch (error) {
    throw `The date you provided appears to be invalid`;
  }
};

export interface ChangingTimeProps {
  amount: number;
  unit: TIME_UNITS;
}

export const futureISO = ({ amount, unit }: ChangingTimeProps) =>
  dayjs().add(amount, unit).toISOString();

export const futureUNIX = ({ amount, unit }: ChangingTimeProps) => dayjs().add(amount, unit).unix();

export const pastISO = ({ amount, unit }: ChangingTimeProps) =>
  dayjs().subtract(amount, unit).toISOString();

export const pastUNIX = ({ amount, unit }: ChangingTimeProps) =>
  dayjs().subtract(amount, unit).unix();
