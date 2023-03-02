import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';
import { UserTotals } from './totalsCount';

export interface UserEntity extends BaseEntity<AllEntityNames.User> {
  org: string | null; // ! TODO multiple orgs, stored on session
  orgJoinDate?: Date; // ! TODO: this should be on the org or another org event object
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totals: UserTotals;
}
