import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

export type InviteEntity = BaseEntity<AllEntityNames.Invite> & {
  userId: string;
  /**
   * Display name and createdBy denormalized for convenience
   */
  org: {
    id: string;
    name: string;
  };
  orgName: string;
  createdBy: {
    name: string | null; // TODO Why would this ever be null?
    email: string;
  };
  recipientName: string | null;
  expiresAt: Date;
};
