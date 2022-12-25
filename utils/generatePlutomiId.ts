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

export enum EntityPrefix {}

interface GenerateIdProps {
  /**
   * Manually generated createdAt date
   * There will be a top level `createdAt`
   * and this ensures that the ID and that value have the same date
   */
  date: Date;
  entity: AllEntities;
}

export type PlutomiId = `${EntityPrefix}${string}`;

export const generatePlutomiId = ({ date, entity }: GenerateIdProps): PlutomiId => {
  if (!Object.values(AllEntities).includes(entity)) {
    throw new Error('Invalid Entity - Cannot Create ID');
  }

  const id = ksuid.randomSync(date).string;

  let prefix = '';
  if (entity === AllEntities.Org) prefix = 'org_';
  if (entity === AllEntities.User) prefix = 'usr_';
  if (entity === AllEntities.Application) prefix = 'appl_';
  if (entity === AllEntities.Applicant) prefix = 'apcnt_';
  if (entity === AllEntities.Stage) prefix = 'stg_';
  if (entity === AllEntities.Question) prefix = 'ques_';
  if (entity === AllEntities.Invite) prefix = 'inv_';
  if (entity === AllEntities.Webhook) prefix = 'wbhk_';
  if (entity === AllEntities.StageRule) prefix = 'stgrul_';
  if (entity === AllEntities.QuestionRule) prefix = 'quesrul_';
  if (entity === AllEntities.Event) prefix = 'evnt_';
  if (entity === AllEntities.Session) prefix = 'sesh_';
  if (entity === AllEntities.LoginLink) prefix = 'lgnlnk';

  return `${prefix}${id}`;
};
