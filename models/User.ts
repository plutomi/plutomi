import { IndexableProperties } from '../@types/indexableProperties';
import { AllEntities, PlutomiId } from '../utils';
import { BaseEntity } from './Base';

export type UserItemId = PlutomiId<AllEntities.User>;

export type UserTargetArray = [
  { id: AllEntities.User; type: IndexableProperties.Entity },
  { id: UserItemId; type: IndexableProperties.Id },
  { id: string; type: IndexableProperties.Email },
];

export interface UserEntity extends BaseEntity {
  /**
   * For most entities, this would be nested like ORG#orgId#APPLICATION#applicationId
   *
   * Top level items will have duplicate data here and in the itemId due to the polymorphic design
   */
  _id: UserItemId;
  org: string | null;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totalInvites: number;
  orgJoinDate?: Date; // ! TODO: this should be on the org or another org event object
  target: UserTargetArray;
}
