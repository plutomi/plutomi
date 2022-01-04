import { APIGatewayProxyEventV2 } from "aws-lambda";
import { unsealData } from "iron-session";
import { DEFAULTS, SESSION_SETTINGS } from "../Config";

/**
 *  Finds an encrypted session seal in a list of cookies form a lambda event
 * @param cookies
 * @param cookieName
 */
export default async function getSessionFromCookies(
  event: APIGatewayProxyEventV2
) {
  const cookies = event.cookies || [];

  // If a cookie by this name exists, extract the seal
  const cookie = cookies?.find((cookie) =>
    cookie.includes(DEFAULTS.COOKIE_NAME + "=")
  );

  if (!cookie) {
    return [null, `${DEFAULTS.COOKIE_NAME} not found`];
  }

  const seal = cookie.split("=")[1];

  if (!seal) {
    return [null, `Session seal not found`];
  }
  if (seal) {
    try {
      const data = await unsealData(seal, SESSION_SETTINGS);

      if (Object.keys(data).length === 0) {
        return [null, `Invalid session`];
      }
      return [data, null];
    } catch (error) {
      return [null, error.message];
    }
  }
}
