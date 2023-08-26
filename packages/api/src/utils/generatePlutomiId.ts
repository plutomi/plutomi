import { IdPrefix, type PlutomiId } from "@plutomi/shared";
import baseX from "base-x";
import { customAlphabet } from "nanoid";

type GenerateIdProps<T extends IdPrefix> = {
  idPrefix: T;
  date: Date;
};

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const bs62 = baseX(BASE62);

const getIdLength = (idPrefix: IdPrefix) => {
  switch (idPrefix) {
    case IdPrefix.SESSION:
      return 50;

    default:
      return 10;
  }
};

// For some IDs, the timestamp is omitted as they should be fully random.
const prefixesWithoutTimestamps: IdPrefix[] = [IdPrefix.SESSION];

/**
 *
 * Creates a PlutomiId. IDs are comprised of a prefix, timestamp, and unique identifier.
 * @param idPrefix The prefix of the ID. For example, if you want to create a user ID, you would pass in `IdPrefix.USER`.
 * @param date The date to use for the ID. This is used to generate the timestamp. You have to pass this in
 * because we're also storing the date in the created_at field of the entity and these should be the same.
 *
 */
export const generatePlutomiId = <T extends IdPrefix>({
  date,
  idPrefix
}: GenerateIdProps<T>): PlutomiId<T> => {
  const randomId = customAlphabet(BASE62, getIdLength(idPrefix))();

  if (prefixesWithoutTimestamps.includes(idPrefix)) {
    return `${idPrefix}_${randomId}`;
  }

  const nowInMs = date.getTime();
  const base62Date = bs62.encode(Buffer.from(nowInMs.toString()));
  const hashedId = `${base62Date}${randomId}`;

  return `${idPrefix}_${hashedId}`;
};
