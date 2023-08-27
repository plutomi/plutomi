import type { RelatedToArray } from "../indexableProperties";
import type { IdPrefix } from "./idPrefix";
import type { BaseEntity } from "./baseEntity";

type WaitListUserRelatedToArray = [
  ...RelatedToArray<IdPrefix.WAIT_LIST_USER>
  // Get a user by email
  // { id: Email; type: RelatedToType.WAIT_LIST_USERS }
];

export type WaitListUser = BaseEntity<IdPrefix.WAIT_LIST_USER> & {
  email: string;
  related_to: WaitListUserRelatedToArray;
};
