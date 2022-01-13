import { unsealData } from "iron-session";
import { COOKIE_NAME, SESSION_SETTINGS, AUTH_ERRORS } from "../Config";
import { UserSessionData } from "../types/main";
import * as Time from "../utils/time";
/**
 *  Finds an encrypted session seal in a list of cookies form a lambda event
 * @param cookies
 * @param cookieName
 */
type GetSessionFromCookiesResponse = [UserSessionData, null] | [null, string];

export default async function getSessionFromCookies(
  event // TODO this type is broken as each event type differs per lambda function
): Promise<GetSessionFromCookiesResponse> {
  console.log("Getting Session From Cookies", event);
  const cookies = event.cookies || [];

  // If a cookie by this name exists, extract the seal
  const cookie = cookies?.find((cookie) => cookie.includes(COOKIE_NAME + "="));
  if (!cookie) {
    return [null, AUTH_ERRORS.COOKIE_NOT_FOUND];
  }

  const seal = cookie.split("=")[1];

  if (!seal) {
    return [null, AUTH_ERRORS.SEAL_NOT_FOUND];
  }
  if (seal) {
    try {
      const session = await unsealData(seal, SESSION_SETTINGS);

      if (Object.keys(session).length === 0) {
        return [null, AUTH_ERRORS.INVALID_SESSION];
      }

      if (session.expiresAt <= Time.currentISO()) {
        return [null, AUTH_ERRORS.SESSION_EXPIRED];
      }

      return [session, null];
    } catch (error) {
      return [null, error.message];
    }
  }
}
