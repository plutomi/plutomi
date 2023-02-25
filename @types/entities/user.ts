import { AllEntityNames } from '../utils';
import { BaseEntity } from './baseEntity';

export interface UserEntity extends BaseEntity<AllEntityNames.User> {
  org: string | null; // ! TODO multiple orgs
  orgJoinDate?: Date; // ! TODO: this should be on the org or another org event object
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totalInvites: number;
}
