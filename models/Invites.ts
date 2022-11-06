import { BaseEntity } from './Base';

/**
 * There is no collection for this, it's just a type
 */
export interface InviteEntity extends BaseEntity {
  /**
   * Name of person who invited, if not, it's the email
   */
  invitedByName: string;
  /**
   * Display name for the org
   */
  orgName: string;
  orgId: string;
  expiresAt: Date;
}
