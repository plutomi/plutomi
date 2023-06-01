import { IdPrefix, type PlutomiId } from "@plutomi/shared";
import ksuid from "ksuid";
import { customAlphabet } from "nanoid";

type GenerateIdProps<T extends IdPrefix> = {
  date: Date;
  idPrefix: T;
};

export const generatePlutomiId = <T extends IdPrefix>({
  date,
  idPrefix
}: GenerateIdProps<T>): PlutomiId<T> => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const nanoid = customAlphabet(characters, 50);

  const id =
    // Do not include a timestamp or -_ in the sessionId
    idPrefix === IdPrefix.SESSION ? nanoid() : ksuid.randomSync(date).string;

  return `${idPrefix}_${id}`;
};
