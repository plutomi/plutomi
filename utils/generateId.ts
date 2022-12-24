import ksuid from 'ksuid';

export enum EntityPrefix {
  Company = 'co_',
  User = 'usr_',
  Application = 'appl_',
  Applicant = 'apcnt_',
  Stage = 'stg_',
  Question = 'ques_',
  Invite = 'inv_',
  Webhook = 'wbhk_',
  StageRule = 'stgrl_',
  QuestionRule = 'quesrl_',
  Event = 'evt_',
  Session = 'sesh_',
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

const main = ({ date, entityPrefix }: GenerateIdProps): PlutomiId => {
  const id = ksuid.randomSync(date).string;

  return `${entityPrefix}${id}`;
};
