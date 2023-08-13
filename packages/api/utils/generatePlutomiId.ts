import { IdPrefix, type PlutomiId } from "@plutomi/shared";
import { init as initCuid } from "@paralleldrive/cuid2";
import baseX from "base-x";

type GenerateIdProps<T extends IdPrefix> = {
  idPrefix: T;
  date: Date;
};

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const bs62 = baseX(BASE62);

/**
 *
 * Creates a PlutomiId. IDs are comprised of a prefix, timestamp, and unique identifier.
 * @param idPrefix The prefix of the ID. For example, if you want to create a user ID, you would pass in `IdPrefix.USER`.
 * @param date The date to use for the ID. This is used to generate the timestamp. You have to pass this in
 * because we're also storing the date in the created_at field of the entity and these should be the same.
 *
 * For sessions IDs, the timestamp is omitted as these should be fully random.
 */
export const generatePlutomiId = <T extends IdPrefix>({
  date,
  idPrefix
}: GenerateIdProps<T>): PlutomiId<T> => {
  const isSession = idPrefix === IdPrefix.SESSION;
  // You don't need a ton of entropy as we have millisecond precision on the timestamp already
  const randomId = initCuid({
    length: isSession ? 100 : 10
  })();

  if (isSession) {
    return `${idPrefix}_${randomId}`;
  }

  const nowInMs = date.getTime();
  const idWithTimestamp = `${nowInMs}${randomId}`;
  const hashed = bs62.encode(Buffer.from(idWithTimestamp));

  return `${idPrefix}_${hashed}`;
};
