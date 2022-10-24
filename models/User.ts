import { IdxTypes } from '../types/main';
import { BaseEntity } from './Base';

export type UserShardKey = `USER#${string}`;
type IndexedEmail = { type: IdxTypes.Email; value: string };
type IndexedOrg = { type: IdxTypes.Org; value: string | null };
type IndexedId = { type: IdxTypes.Id; value: string };

type UserTargetArray = Array<IndexedEmail | IndexedOrg | IndexedId>;
export interface UserEntity extends BaseEntity {
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totalInvites: number;
  orgJoinDate?: Date;
  target: UserTargetArray;
}
