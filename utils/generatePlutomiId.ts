import ksuid from 'ksuid';

export enum AllEntities {
  Org = 'Org',
  User = 'User',
  Application = 'Application',
  Applicant = 'Applicant',
  Stage = 'Stage',
  Question = 'Question',
  Invite = 'Invite',
  Webhook = 'Webhook',
  StageRule = 'StageRule',
  QuestionRule = 'QuestionRule',
  Event = 'Event',
  Session = 'Session',
  LoginLink = 'LoginLink',
}

interface GenerateIdProps {
  /**
   * Manually generated createdAt date
   * There will be a top level `createdAt`
   * and this ensures that the ID and that value have the same date
   */
  date: Date;
  entity: AllEntities;
}

export const EntityPrefix = {
  [AllEntities.User]: 'usr_',
  [AllEntities.Org]: 'org_',
  [AllEntities.Application]: 'appl_',
  [AllEntities.Applicant]: 'apcnt_',
  [AllEntities.Stage]: 'stg_',
  [AllEntities.StageRule]: 'stgrul_',
  [AllEntities.Question]: 'ques_',
  [AllEntities.QuestionRule]: 'quesrul_',
  [AllEntities.Invite]: 'inv_',
  [AllEntities.Webhook]: 'wbhk_',
  [AllEntities.Event]: 'evnt_',
  [AllEntities.Session]: 'sesh_',
  [AllEntities.LoginLink]: 'lgnlnk_',
} as const;

type EntityPrefixValues = typeof EntityPrefix[keyof typeof EntityPrefix];

export type PlutomiId = `${EntityPrefixValues}${string}`;

export const generatePlutomiId = ({ date, entity }: GenerateIdProps): PlutomiId => {
  if (!Object.values(AllEntities).includes(entity)) {
    throw new Error(`Invalid Entity: ${entity} - Cannot Create ID`);
  }

  const id = ksuid.randomSync(date).string;

  return `${EntityPrefix[entity]}${id}`;
};
