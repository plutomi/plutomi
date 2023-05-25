import type { RelatedToType, RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { SessionStatus } from "../sessionStatus";
import type { AllEntityNames } from "./allEntityNames";
import type { BaseEntity } from "./baseEntity";

type SessionRelatedToArray = [
  ...RelatedToArray<AllEntityNames.SESSION>,
  // Get all sessions for a user
  { id: PlutomiId<AllEntityNames.USER>; type: RelatedToType.SESSION }
  //  Get all sessions in an org
  // { id: UserOrgId; type: RelatedToType.User },
  //  Get all sessions in a workspace
  // { id: UserWorkspaceId; type: RelatedToType.User },
];

export type Session = BaseEntity<AllEntityNames.SESSION> & {
  ip: string;
  // ISO timestamp
  expiresAt: string;
  userAgent: string;
  relatedTo: SessionRelatedToArray;
  status: SessionStatus;
};
