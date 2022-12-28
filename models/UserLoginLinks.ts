import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';

import { AllEntityNames, PlutomiId } from '../utils';

export type UniqueLoginLinkId = PlutomiId<AllEntityNames.LoginLink>;

export type UserLoginLinkTargetArray = [
  { id: AllEntityNames.LoginLink; type: IndexableProperties.Entity },
  { id: UniqueLoginLinkId; type: IndexableProperties.Id },
  { id: string; type: IndexableProperties.Email },
];

export interface UserLoginLinkEntity extends BaseEntity {
  /**
   * For most entities, this would be nested like ORG#orgId#APPLICATION#applicationId
   *
   * Top level items will have duplicate data here and in the itemId due to the polymorphic design
   */
  _id: UniqueLoginLinkId;
  itemId: UniqueLoginLinkId; // TODO remove this index?
  org: string | null;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totalInvites: number;
  orgJoinDate?: Date;
  target: UserLoginLinkTargetArray;
}
