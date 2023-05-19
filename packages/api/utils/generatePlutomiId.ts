import type { AllEntityNames, PlutomiId } from "@plutomi/shared";
import ksuid from "ksuid";

type GenerateIdProps<T extends AllEntityNames> = {
  date: Date;
  entity: T;
};

export const generatePlutomiId = <T extends AllEntityNames>({
  date,
  entity
}: GenerateIdProps<T>): PlutomiId<T> => {
  const id = ksuid.randomSync(date).string;

  return `${entity}_${id}`;
};
