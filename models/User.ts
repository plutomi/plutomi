import { IndexableProperties } from '../@types/indexableProperties';
import { AllEntityNames, EntityPrefixes } from '../utils';
import { BaseEntity } from './Base';

export type UniqueUserId = `${typeof EntityPrefixes[AllEntityNames.User]}${string}`;

export type UserTargetArray = [
  { id: AllEntityNames.User; type: IndexableProperties.Entity },
  { id: UniqueUserId; type: IndexableProperties.Id },
  { id: string; type: IndexableProperties.Email },
];

export interface UserEntity extends BaseEntity {
  /**
   * For most entities, this would be nested like ORG#orgId#APPLICATION#applicationId
   *
   * Top level items will have duplicate data here and in the uniqueId due to the polymorphic design
   */
  _id: UniqueUserId;
  uniqueId: UniqueUserId; // TODO remove this index? TODO Rename to customId?
  org: string | null;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totalInvites: number;
  orgJoinDate?: Date;
  target: UserTargetArray;
}
