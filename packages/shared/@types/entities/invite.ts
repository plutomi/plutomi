// import type { RelatedToType, RelatedToArray } from "../indexableProperties";
// import type { PlutomiId } from "../plutomiId";
// import type { IdPrefix } from "./idPrefix";
// import type { BaseEntity } from "./baseEntity";

// export type InviteRelatedToArray = [
//   ...RelatedToArray<IdPrefix.Invite>,
//   // Get all invites for a user
//   { id: PlutomiId<IdPrefix.User>; type: RelatedToType.Invite },
//   // Get all invites for an org
//   { id: PlutomiId<IdPrefix.Org>; type: RelatedToType.Invite },
//   // Get invites associated for a given membership (should only ever be one)
//   { id: PlutomiId<IdPrefix.Membership>; type: RelatedToType.Invite },
//   // Get invites associated for a given workspace
//   { id: PlutomiId<IdPrefix.Workspace>; type: RelatedToType.Invite }
// ];

// export type Invite = BaseEntity<IdPrefix.Invite> & {
//   org: {
//     id: string;
//     name: string;
//   };
//   created_by: {
//     // Null incase that user hasn't setup their name,
//     // we show on the invite that "You have been invited" instead of by <name>
//     id: string;
//     name: string | null;
//     email: string;
//   };
//   recipient: {
//     id: string;
//     name: string;
//     email: string;
//   };
//   expiresAt: Date;
//   related_to: InviteRelatedToArray;
// };
