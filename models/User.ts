import { IdxTypes } from '../types/main';
import { BaseEntity } from './Base';

type Extends<T, U extends T> = U;

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
  target: Array<{
    type: Extends<keyof typeof IdxTypes, 'Org' | 'Email' | 'Id'>;
    value: string | null;
  }>;
}
