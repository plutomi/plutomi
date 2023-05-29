import type { Email } from "../email";
import type { RelatedToType, RelatedToArray } from "../indexableProperties";
// import type { PlutomiId } from "../plutomiId";
import type { AllEntityNames } from "./allEntityNames";
import type { BaseEntity } from "./baseEntity";

// type UserTotals = {
//   invites: number;
//   memberships: number;
//   workspaces: number;
// };

// type UserOrgId = PlutomiId<AllEntityNames.Org> | null;
// type UserWorkspaceId = PlutomiId<AllEntityNames.Workspace> | null;

type UserRelatedToArray = [
  ...RelatedToArray<AllEntityNames.USER>,
  // Get a user by email
  { id: Email; type: RelatedToType.USERS }
  // // Get all users in an org
  // { id: UserOrgId; type: RelatedToType.USERS },
  // // Get all users in a workspace
  // { id: UserWorkspaceId; type: RelatedToType.USERS },
];

export type User = BaseEntity<AllEntityNames.USER> & {
  firstName: string | null;
  lastName: string | null;
  email: Email;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  canReceiveEmails: boolean;
  relatedTo: UserRelatedToArray;
};
