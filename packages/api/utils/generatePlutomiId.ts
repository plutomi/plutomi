import { IdPrefix, type PlutomiId } from "@plutomi/shared";
import ksuid from "ksuid";
import { customAlphabet } from "nanoid";

type GenerateIdProps<T extends IdPrefix> = {
  date: Date;
  entity: T;
};

export const generatePlutomiId = <T extends IdPrefix>({
  date,
  entity
}: GenerateIdProps<T>): PlutomiId<T> => {
  // Do not include a timestamp or -_ in the sessionId
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const nanoid = customAlphabet(characters, 50);

  const id =
    entity === IdPrefix.SESSION ? nanoid() : ksuid.randomSync(date).string;

  return `${entity}_${id}`;
};
