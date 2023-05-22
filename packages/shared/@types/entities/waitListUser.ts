import type { Email } from "../email";
import type { RelatedToType, RelatedToArray } from "../indexableProperties";
import type { AllEntityNames } from "./allEntityNames";
import type { BaseEntity } from "./baseEntity";

type WaitListUserRelatedToArray = [
  ...RelatedToArray<AllEntityNames.WAIT_LIST_USER>,
  // Get a user by email
  { id: Email; type: RelatedToType.WAIT_LIST_USER }
];

export type WaitListUser = BaseEntity<AllEntityNames.WAIT_LIST_USER> & {
  email: Email;
  createdAt: string;
  relatedTo: WaitListUserRelatedToArray;
};
