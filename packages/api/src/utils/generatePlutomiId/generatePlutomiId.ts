import { IdPrefix, type PlutomiId } from "@plutomi/shared";
import baseX from "base-x";
import { customAlphabet } from "nanoid";

type GenerateIdProps<T extends IdPrefix> = {
  idPrefix: T;
  date: Date;
};

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const bs62 = baseX(BASE62);

// For some IDs, the timestamp is omitted as they should be fully random
const prefixesWithoutTimestamps: IdPrefix[] = [IdPrefix.SESSION];

const getIdLength = (idPrefix: IdPrefix) => {
  switch (idPrefix) {
    case IdPrefix.SESSION:
      return 50;

    default:
      return 12;
  }
};

/**
 *
 * Creates a PlutomiId. Most IDs are comprised of a prefix, base62 encoded 64bit timestamp, and a unique identifier.
 * Some Ids are fully random like for sessions.
 *
 * @param idPrefix The prefix of the ID. For example, if you want to create a user ID, you would pass in `IdPrefix.USER`.
 * @param date The date to use for the ID. This is used to generate the timestamp. This should be the same date stored
 * in the created_at field of the entity.
 *
 */
export const generatePlutomiId = <T extends IdPrefix>({
  date,
  idPrefix
}: GenerateIdProps<T>): PlutomiId<T> => {
  const randomData = customAlphabet(BASE62, getIdLength(idPrefix))();

  if (prefixesWithoutTimestamps.includes(idPrefix)) {
    return `${idPrefix}_${randomData}`;
  }

  const nowInMs = BigInt(date.getTime()); // 64bit timestamp
  const timeBuffer = Buffer.alloc(8); // allocate 8 bytes
  timeBuffer.writeBigInt64BE(nowInMs, 0);

  // Base62 encode just the timestamp
  const encodedDateOnly = bs62.encode(timeBuffer);

  const suffix = `${encodedDateOnly}${randomData}`;

  return `${idPrefix}_${suffix}`;
};
