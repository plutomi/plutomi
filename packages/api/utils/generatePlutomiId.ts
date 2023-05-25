import { AllEntityNames, type PlutomiId } from "@plutomi/shared";
import ksuid from "ksuid";
import { nanoid } from "nanoid";

type GenerateIdProps<T extends AllEntityNames> = {
  date: Date;
  entity: T;
};

export const generatePlutomiId = <T extends AllEntityNames>({
  date,
  entity
}: GenerateIdProps<T>): PlutomiId<T> => {
  let id = ksuid.randomSync(date).string;

  if (entity === AllEntityNames.SESSION) {
    // Do not include a timestamp in the session id
    id = nanoid(50);
  }
  return `${entity}_${id}`;
};
