import type { Email } from "../email";
import type { RelatedToType, RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
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

type LoginCodeRelatedToArray = [
  ...RelatedToArray<AllEntityNames.LOGIN_CODE>,
  // Get login codes for a user
  { id: PlutomiId<AllEntityNames.USER>; type: RelatedToType.LOGIN_CODE }
];

export type LoginCode = BaseEntity<AllEntityNames.LOGIN_CODE> & {
  firstName: string | null;
  lastName: string | null;
  email: Email;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  relatedTo: LoginCodeRelatedToArray;
};
