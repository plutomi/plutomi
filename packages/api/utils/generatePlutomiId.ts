import { init } from "@paralleldrive/cuid2";
import { IdPrefix, type PlutomiId } from "@plutomi/shared";
import { typeid } from "typeid-ts";

type GenerateIdProps<T extends IdPrefix> = {
  idPrefix: T;
};

export const generatePlutomiId = <T extends IdPrefix>({
  idPrefix
}: GenerateIdProps<T>): PlutomiId<T> => {
  if (idPrefix === IdPrefix.SESSION) {
    const createSessionId = init({
      length: 100
    });

    return `${idPrefix}_${createSessionId()}`;
  }

  return typeid(idPrefix).toString() as PlutomiId<T>;
};
