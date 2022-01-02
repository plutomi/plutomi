import { unsealData } from "iron-session";
import { DEFAULTS, SESSION_SETTINGS } from "../Config";
import { UserSessionData } from "../types/main";

/**
 *  Finds an encrypted session seal in a list of cookies form a lambda event
 * @param cookies
 * @param cookieName
 */
export default async function getSessionFromCookies(cookies: string[]) {
  // If a cookie by this name exists, extract the seal
  const cookie = cookies?.find((cookie) =>
    cookie.includes(DEFAULTS.COOKIE_NAME + "=")
  );

  if (!cookie) {
    throw `${DEFAULTS.COOKIE_NAME} not found`;
  }

  const seal = cookie.split("=")[1];

  if (!seal) {
    throw "Session seal not found";
  }
  let sessionData: UserSessionData;

  if (seal) {
    try {
      const data: UserSessionData = await unsealData(seal, SESSION_SETTINGS);

      sessionData = { ...data };

      return sessionData;
    } catch (error) {
      throw "Bad seal";
    }
  }
}
