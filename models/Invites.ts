import { IndexableProperties } from '../@types/indexableProperties';
import { BaseEntity } from './Base';

export type InvitesTargetArray = [
  {
    property: IndexableProperties.Email;
    value: string;
  },
];
export interface InviteEntity extends BaseEntity {
  userId: string; // Compound index with ID
  orgId: string; // Compound index with ID
  createdBy: {
    name: string | null;
    email: string;
  };
  recipientName: string | null;
  /**
   * Display name for the org
   */
  orgName: string;
  expiresAt: Date;
  target: InvitesTargetArray;
}
