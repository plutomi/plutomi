import ksuid from 'ksuid';
import { AllEntityNames } from '../@types/entities';

export type PlutomiId<T extends AllEntityNames> = `${T}_${string}`;

interface GenerateIdProps<T> {
  /**
   * Manually generated createdAt date.
   * There will be a top level `createdAt`
   * and this ensures that the ID and that value have the same date
   */
  date: Date;
  entity: AllEntityNames;
}

export const generatePlutomiId = <T extends AllEntityNames>({
  date,
  entity,
}: GenerateIdProps<T>): PlutomiId<T> => {
  const id = ksuid.randomSync(date).string;
  const prefix = AllEntityNames[entity];

  return `${prefix}_${id}`;
};
