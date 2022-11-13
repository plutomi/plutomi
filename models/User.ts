import { IndexableProperties } from '../@types/indexableProperties';
import { BaseEntity } from './Base';

export type UserTargetArray = [{ property: IndexableProperties.Email; value: string }];

export interface UserEntity extends BaseEntity {
  orgId: string | null;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totalInvites: number;
  orgJoinDate?: Date;
  target: UserTargetArray;
}
