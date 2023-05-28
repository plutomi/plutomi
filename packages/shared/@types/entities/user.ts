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
  { id: Email; type: RelatedToType.USER }
  // // Get all users in an org
  // { id: UserOrgId; type: RelatedToType.User },
  // // Get all users in a workspace
  // { id: UserWorkspaceId; type: RelatedToType.User },

  // ! Some notes:
  // To get all the subentities of a user, we can do this:

  // { $or: [ { relatedTo: { $elemMatch:  {id: "user_3810",  type: "files"}}}, { relatedTo: { $elemMatch:  {id: "user_3810",  type: "notes"}}}]}
  // If we try to get the user as well with an OR, the documents examined doubles as Mongo has to do a double check to make sure there weren't any duplicates
  //  BAD - Don't do this -> { $or: [ {_id: "user_3810"}, { relatedTo: { $elemMatch:  {id: "user_3810",  type: "files"}}}, { relatedTo: { $elemMatch:  {id: "user_3810",  type: "notes"}}}]}
  // Whenever we fetch an entity, we almost always want to fetch it first, check if it exists, and if so, get the rest of the data and group it together
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
