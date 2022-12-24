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

export enum EntityPrefix {
  Org = 'org_',
  User = 'usr_',
  Application = 'appl_',
  Applicant = 'apcnt_',
  Stage = 'stg_',
  Question = 'ques_',
  Invite = 'inv_',
  Webhook = 'wbhk_',
  StageRule = 'stgrul_',
  QuestionRule = 'quesrul_',
  Event = 'evnt_',
  Session = 'sesh_',
  LoginLink = 'lgnlnk_',
}

interface GenerateIdProps {
  /**
   * Manually generated createdAt date
   * There will be a top level `createdAt`
   * and this ensures that the ID and that value have the same date
   */
  date: Date;
  entityPrefix: EntityPrefix;
}

export type PlutomiId = `${EntityPrefix}${string}`;

export const generatePlutomiId = ({ date, entityPrefix }: GenerateIdProps): PlutomiId => {
  const id = ksuid.randomSync(date).string;

  return `${entityPrefix}${id}`;
};
