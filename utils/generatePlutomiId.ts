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

export const EntityPrefixes = {
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

type EntityValues = keyof typeof AllEntities;
interface GenerateIdProps {
  /**
   * Manually generated createdAt date
   * There will be a top level `createdAt`
   * and this ensures that the ID and that value have the same date
   */
  date: Date;
  entity: EntityValues;
}

type PlutomiId = `${typeof EntityPrefixes[EntityValues]}${string}`;

export const generatePlutomiId = ({ date, entity }: GenerateIdProps): PlutomiId => {
  const id = ksuid.randomSync(date).string;

  return `${EntityPrefixes[entity]}${id}`;
};
