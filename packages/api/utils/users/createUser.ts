import {
  type Email,
  type User,
  IdPrefix,
  RelatedToType
} from "@plutomi/shared";
import { generatePlutomiId } from "../generatePlutomiId";

type CreateUserProps = {
  email: Email;
};
export const createUser = ({ email }: CreateUserProps): User => {
  const now = new Date();
  const userId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.USER
  });

  const newUser: User = {
    _id: userId,
    _type: IdPrefix.USER,
    first_name: null,
    last_name: null,
    email,
    email_verified: false,
    email_verified_at: null,
    can_receive_emails: true,
    unsubscribed_from_emails_at: null,
    is_requesting_totp: false,
    created_at: now,
    updated_at: now,
    related_to: [
      {
        id: userId,
        type: RelatedToType.SELF
      }
    ]
  };

  return newUser;
};
