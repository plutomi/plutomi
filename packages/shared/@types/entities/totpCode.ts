import type { Email } from "../email";
import type { RelatedToType, RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { IdPrefix } from "./idPrefix";
import type { BaseEntity } from "./baseEntity";

type TOTPCodeRelatedToArray = [
  ...RelatedToArray<IdPrefix.TOTP>,
  // Get login codes for a user
  { id: PlutomiId<IdPrefix.USER>; type: RelatedToType.TOTPS },
  // Get login codes for an email
  { id: Email; type: RelatedToType.TOTPS }
];

export enum TOTPCodeStatus {
  /**
   * Code was sent, and is awaiting use
   */
  ACTIVE = "ACTIVE",
  /**
   * Code was used
   */
  USED = "USED",
  /**
   * Code expired due to time
   */
  EXPIRED = "EXPIRED",
  /**
   * Code was invalidated due to a new code being sent
   */
  INVALIDATED = "INVALIDATED"
}

export type TOTPCode = BaseEntity<IdPrefix.TOTP> & {
  code: string;
  user: PlutomiId<IdPrefix.USER>;
  email: Email;
  status: TOTPCodeStatus;
  expires_at: Date;
  expired_at: Date | null;
  used_at: Date | null;
  invalidated_at: Date | null;
  related_to: TOTPCodeRelatedToArray;
};
