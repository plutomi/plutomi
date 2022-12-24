import { IndexableProperties } from '../@types/indexableProperties';
import { AllEntities } from '../utils';
import { BaseEntity } from './Base';

export type UserTargetArray = [
  { id: AllEntities.User; type: IndexableProperties.Entity },
  { id: string; type: IndexableProperties.Id },
  { id: string; type: IndexableProperties.Email },
];

export interface UserEntity extends BaseEntity {
  org: string | null;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totalInvites: number;
  orgJoinDate?: Date;
  target: UserTargetArray;
}
