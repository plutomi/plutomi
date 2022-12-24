import { IndexableProperties } from '../@types/indexableProperties';
import { AllEntities } from '../utils';
import { BaseEntity } from './Base';

export type InvitesTargetArray = [
  { id: AllEntities.Invite; type: IndexableProperties.Entity },
  { id: string; type: IndexableProperties.Id },
  /**
   * Get all invites for a given email
   */
  { id: string; type: IndexableProperties.Email },
  /**
   * Get all items related to this user, ! TODO might not be needed if we create it under the _id field
   */
  { id: string; type: IndexableProperties.User },
];

export interface InviteEntity extends BaseEntity {
  userId: string;
  org: string;
  /**
   * Display name for the org
   */
  orgName: string;
  createdBy: {
    name: string | null;
    email: string;
  };
  recipientName: string | null;
  expiresAt: Date;
  target: InvitesTargetArray;
}
