import ksuid from 'ksuid';
import { AllEntityNames } from '../../@types/entities/allEntityNames';

export type PlutomiId<T extends AllEntityNames> = `${T}_${string}`;

interface GenerateIdProps<T extends AllEntityNames> {
  date: Date;
  entity: T;
}

export const generatePlutomiId = <T extends AllEntityNames>({
  date,
  entity,
}: GenerateIdProps<T>): PlutomiId<T> => {
  const id = ksuid.randomSync(date).string;

  return `${entity}_${id}`;
};
