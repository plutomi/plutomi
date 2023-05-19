import ksuid from "ksuid";
import type { AllEntityNames } from "../@types/entities";
import type { PlutomiId } from "../@types/plutomiId";

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
