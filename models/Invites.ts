import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';
import { Extends } from '../@types/extends';

export type InvitesTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: Extends<keyof typeof IndexableProperties, 'Org' | 'Email'>;
  }
>;
/**
 * There is no collection for this, it's just a type
 */
export interface InviteEntity extends BaseEntity {
  /**
   * Name of person who invited, if not, it's the email
   */
  invitedByName: string | null;
  /**
   * Display name for the org
   */
  orgName: string;
  expiresAt: Date;
  target: InvitesTargetArray;
}
