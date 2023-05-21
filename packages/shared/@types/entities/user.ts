import type { Email } from "../email";
import type { IndexableType, IndexedTargetArray } from "../indexableProperties";
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

type UserTargetArray = [
  ...IndexedTargetArray<AllEntityNames.User>,
  // // Get all users in an org
  // { id: UserOrgId; type: IndexableType.User },
  // // Get all users in a workspace
  // { id: UserWorkspaceId; type: IndexableType.User },
  // Get a user by email
  { id: Email; type: IndexableType.Email }
];

export type User = BaseEntity<AllEntityNames.User> & {
  data: {
    firstName: string | null;
    lastName: string | null;
    // org: UserOrgId;
    // workspace: UserWorkspaceId;
    email: Email;
    emailVerified: boolean;
    canReceiveEmails: boolean;
    // totals: UserTotals;
  };
  target: UserTargetArray;
};
