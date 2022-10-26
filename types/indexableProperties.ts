export enum IndexableProperties {
  User = 'User',
  Org = 'Org',
  OrgInvite = 'OrgInvite',
  Opening = 'Opening',
  OpeningState = 'OpeningState',
  Stage = 'Stage',
  UserLoginLink = 'UserLoginLink',
  Question = 'Question',
  Webhook = 'Webhook',
  Email = 'Email',
  CreatedBy = 'CreatedBy',
  PreviousStage = 'PreviousStage',
  NextStage = 'NextStage',
  Id = 'Id',
}

export type IndexIdTypes = string | null;
export type IndexedTargetArrayItem = { property: IndexableProperties; value: IndexIdTypes };
export type IndexedTargetArray = Array<IndexedTargetArrayItem>;
