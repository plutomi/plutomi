import ksuid from 'ksuid';
// import { AllEntityNames } from '../@types/allEntityNames';

export enum AllEntityNames {
  Application = 'application',
  Invite = 'invite',
  Org = 'org',
  User = 'user',
  Question = 'question',
  Stage = 'stage',
}

type PlutomiId<T extends AllEntityNames> = `${T}_${string}`;

interface GenerateIdProps<T extends AllEntityNames> {
  date: Date;
  entity: T;
}

export const generatePlutomiId = <T extends AllEntityNames>({
  date,
  entity,
}: GenerateIdProps<T>): PlutomiId<T> => {
  const id = ksuid.randomSync(date).string;
  const prefix = AllEntityNames[entity as unknown as keyof typeof AllEntityNames];

  return `${prefix}_${id}` as PlutomiId<T>;
};

const x = generatePlutomiId({
  date: new Date(),
  entity: AllEntityNames.Org,
});
