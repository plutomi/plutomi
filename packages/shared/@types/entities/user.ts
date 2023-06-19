import type { Email } from "../email";
import type { RelatedToArray } from "../indexableProperties";
import type { IdPrefix } from "./idPrefix";
import type { BaseEntity } from "./baseEntity";

type UserRelatedToArray = [...RelatedToArray<IdPrefix.USER>];

export type User = BaseEntity<IdPrefix.USER> & {
  first_name: string | null;
  last_name: string | null;
  email: Email;
  email_verified: boolean;
  email_verified_at: Date | null;
  can_receive_emails: boolean;
  unsubscribed_from_emails_at: Date | null;
  related_to: UserRelatedToArray;
};
