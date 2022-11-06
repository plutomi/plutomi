import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';
import { Extends } from '../@types/extends';

export type InvitesTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: Extends<keyof typeof IndexableProperties, 'Org' | 'Email' | 'User'>;
  }
>;
/**
 * There is no collection for this, it's just a type
 */
export interface InviteEntity extends BaseEntity {
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
