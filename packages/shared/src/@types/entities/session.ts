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

  // Get all sessions for a workspace
  {
    id: PlutomiId<IdPrefix.WORKSPACE> | EmptyValues.NO_WORKSPACE;
    type: RelatedToType.SESSIONS;
  }
];

export type Session = BaseEntity<IdPrefix.SESSION> & {
  user: PlutomiId<IdPrefix.USER>;
  ip: string;
  expires_at: string;
  user_agent: string;
  related_to: SessionRelatedToArray;
  logged_out_at: Date | null;
  expired_at: Date | null;
  revoked_at: Date | null;
  workspace_switched_at: Date | null;
  active_at: Date | null;
  status: SessionStatus;
  org: PlutomiId<IdPrefix.ORG> | EmptyValues.NO_ORG;
  workspace: PlutomiId<IdPrefix.WORKSPACE> | EmptyValues.NO_WORKSPACE;
};