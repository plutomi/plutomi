import type { Email } from "../email";
import type { RelatedToType, RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { AllEntityNames } from "./allEntityNames";
import type { BaseEntity } from "./baseEntity";

type TOTPCodeRelatedToArray = [
  ...RelatedToArray<AllEntityNames.TOTP_CODE>,
  // Get login codes for a user
  { id: PlutomiId<AllEntityNames.USER>; type: RelatedToType.TOTP_CODE },
  // Get login codes for an email
  { id: Email; type: RelatedToType.TOTP_CODE }
];

export enum TOTPCodeStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED"
}

export type TOTPCode = BaseEntity<AllEntityNames.TOTP_CODE> & {
  code: string;
  // ISO Timestamp
  expiresAt: string;
  relatedTo: TOTPCodeRelatedToArray;
  status: TOTPCodeStatus;
};
