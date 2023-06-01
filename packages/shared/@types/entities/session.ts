import type { RelatedToType, RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { SessionStatus } from "../sessionStatus";
import type { IdPrefix } from "./idPrefix";
import type { BaseEntity } from "./baseEntity";
import type { EmptyValues } from "../emptyValues";

type SessionRelatedToArray = [
  ...RelatedToArray<IdPrefix.SESSION>,
  // Get all sessions for a user
  { id: PlutomiId<IdPrefix.USER>; type: RelatedToType.SESSIONS },
  // Get all sessions for an org
  {
    id: PlutomiId<IdPrefix.ORG> | EmptyValues.NO_ORG;
    type: RelatedToType.SESSIONS;
  },
  // Get all sessions for a workspace
  {
    id: PlutomiId<IdPrefix.WORKSPACE> | EmptyValues.NO_WORKSPACE;
    type: RelatedToType.SESSIONS;
  }
];

export type Session = BaseEntity<IdPrefix.SESSION> & {
  user: PlutomiId<IdPrefix.USER>;
  ip: string;
  expiresAt: string;
  userAgent: string;
  relatedTo: SessionRelatedToArray;
  status: SessionStatus;
};
