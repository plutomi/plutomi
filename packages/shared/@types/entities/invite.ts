import type { IndexableType, RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { AllEntityNames } from "./allEntityNames";
import type { BaseEntity } from "./baseEntity";

export type InviteRelatedToArray = [
  ...RelatedToArray<AllEntityNames.Invite>,
  // Get all invites for a user
  { id: PlutomiId<AllEntityNames.User>; type: IndexableType.Invite },
  // Get all invites for an org
  { id: PlutomiId<AllEntityNames.Org>; type: IndexableType.Invite },
  // Get invites associated for a given membership (should only ever be one)
  { id: PlutomiId<AllEntityNames.Membership>; type: IndexableType.Invite },
  // Get invites associated for a given workspace
  { id: PlutomiId<AllEntityNames.Workspace>; type: IndexableType.Invite }
];

export type Invite = BaseEntity<AllEntityNames.Invite> & {
  org: {
    id: string;
    name: string;
  };
  createdBy: {
    // Null incase that user hasn't setup their name,
    // we show on the invite that "You have been invited" instead of by <name>
    id: string;
    name: string | null;
    email: string;
  };
  recipient: {
    id: string;
    name: string;
    email: string;
  };
  expiresAt: Date;
  relatedTo: InviteRelatedToArray;
};
