import { IndexedEntities } from '../types/main';
import { BaseEntity } from './Base';

type UserIndexedProperties = 'Org' | 'Email' | 'Id';
type UserTargetArrayItem = { type: UserIndexedProperties; value: string | null };
export type UserTargetArray = Array<UserTargetArrayItem>;

export type UserShardKey = `USER#${string}`;

export interface UserEntity extends BaseEntity {
  shardKey: UserShardKey;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totalInvites: number;
  orgJoinDate?: Date;
  target: UserTargetArray;
}
