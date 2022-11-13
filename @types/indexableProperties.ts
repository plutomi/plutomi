export enum IndexableProperties {
  /**
   *  Only used for users as they don't have a compound index with an orgId or a userId
   */
  CustomId = 'CustomId',
  User = 'User',
  UserLoginLink = 'UserLoginLink',
  Org = 'Org',
  OrgInvite = 'OrgInvite',
  Opening = 'Opening',
  OpeningState = 'OpeningState',
  Stage = 'Stage',
  PreviousStage = 'PreviousStage',
  NextStage = 'NextStage',
  Question = 'Question',
  Webhook = 'Webhook',
  Email = 'Email',
  CreatedAt = 'CreatedAt',
  UpdatedAt = 'UpdatedAt',
  ExpiresAt = 'ExpiresAt',
  CreatedBy = 'CreatedBy',
  PreviousQuestion = 'PreviousQuestion',
  NextQuestion = 'NextQuestion',
}

export type IndexIdTypes = string | null;
export type IndexedTargetArrayItem = { property: IndexableProperties; value: IndexIdTypes };
export type IndexedTargetArray = Array<IndexedTargetArrayItem | { customId: string }>;
