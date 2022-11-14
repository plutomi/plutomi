import { Extends } from '../@types/extends';
import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';

export type InvitesTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: Extends<keyof typeof IndexableProperties, 'Email'>;
  }
>;
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
