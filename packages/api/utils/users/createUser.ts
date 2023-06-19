import {
  type Email,
  type User,
  IdPrefix,
  RelatedToType
} from "@plutomi/shared";
import KSUID from "ksuid";
import { generatePlutomiId } from "../generatePlutomiId";

type CreateUserProps = {
  email: Email;
  removedKeys?: Array<keyof User>;
};
export const createUser = ({ email, removedKeys }: CreateUserProps): User => {
  const now = new Date();
  const userId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.USER
  });

  const newUser: User = {
    _id: userId,
    _type: IdPrefix.USER,
    _locked_at: KSUID.randomSync().string,
    first_name: null,
    last_name: null,
    email,
    email_verified: false,
    email_verified_at: null,
    can_receive_emails: true,
    unsubscribed_from_emails_at: null,
    created_at: now,
    updated_at: now,
    related_to: [
      {
        id: userId,
        type: RelatedToType.SELF
      }
    ]
  };

  if (removedKeys !== undefined) {
    removedKeys.forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete newUser[key];
    });
  }

  return newUser;
};
