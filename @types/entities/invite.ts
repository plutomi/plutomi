import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

export interface InviteEntity extends BaseEntity<AllEntityNames.Invite> {
  userId: string;
  org: string;
  /**
   * Display name and created by denormalized for convenience
   */
  orgName: string;
  createdBy: {
    name: string | null; // TODO Why would this ever be null?
    email: string;
  };
  recipientName: string | null;
  expiresAt: Date;
}
