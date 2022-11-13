export enum IndexableProperties {
  /**
   * Self referential ID of the entity, can also be a custom ID that is not Mongo's _id
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
