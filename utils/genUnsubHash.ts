import * as crypto from "crypto";

/**
 * Generates a hash which can be used to unsubscribe a user or applicant from emails
 * @param id
 * @param email
 * @param unsubscribeSecret
 * @returns
 */
export default function genUnsubHash(
  id: string,
  email: string,
  unsubscribeSecret: String
) {
  return crypto
    .createHash("sha256")
    .update(id + email + unsubscribeSecret)
    .digest("base64url");
}
