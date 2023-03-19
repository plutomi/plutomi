import updateLocale from 'dayjs/plugin/updateLocale';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';

dayjs.extend(updateLocale);
dayjs.extend(relativeTime);

const dayjsInstance = dayjs;

/**
 * Dayjs wrapper
 */
export { dayjsInstance as Time };
