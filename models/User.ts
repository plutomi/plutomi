import { IdxTypes } from '../types/main';
import { BaseEntity } from './Base';

type Extends<T, U extends T> = U;

export type UserShardKey = `USER#${string}`;

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
