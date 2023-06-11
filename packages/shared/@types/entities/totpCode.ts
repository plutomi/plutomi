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
  ACTIVE = "ACTIVE",
  USED = "USED",
  EXPIRED = "EXPIRED",
  INVALIDATED = "INVALIDATED"
}

export type TOTPCode = BaseEntity<IdPrefix.TOTP> & {
  code: string;
  user: PlutomiId<IdPrefix.USER>;
  email: Email;
  // ISO Timestamp
  expiresAt: string;
  relatedTo: TOTPCodeRelatedToArray;
  status: TOTPCodeStatus;
  expiredAt?: string;
  usedAt?: string;
  invalidatedAt?: string;
};
