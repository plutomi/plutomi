import { IndexableProperties } from '../@types/indexableProperties';
import { BaseEntity } from './Base';

export type UserTargetArray = [
  { property: IndexableProperties.CustomId; value: string },
  { property: IndexableProperties.Email; value: string },
  { property: IndexableProperties.Org; value: string | null },
];

export interface UserEntity extends BaseEntity {
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totalInvites: number;
  orgJoinDate?: Date;
  target: UserTargetArray;
}
