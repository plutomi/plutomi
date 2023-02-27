import ksuid from 'ksuid';
import { AllEntityNames } from '../@types/allEntityNames';

export type PlutomiId<T extends AllEntityNames> = `${typeof AllEntityNames[T]}_${string}`;

interface GenerateIdProps<T extends AllEntityNames> {
  date: Date;
  entity: T;
}

export const generatePlutomiId = <T extends AllEntityNames>({
  date,
  entity,
}: GenerateIdProps<T>): PlutomiId<T> => {
  const id = ksuid.randomSync(date).string;
  const prefix = AllEntityNames[entity];

  return `${prefix}_${id}`;
};

const x = generatePlutomiId({ date: new Date(), entity: AllEntityNames.Org });
