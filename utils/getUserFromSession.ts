import {
  APIGatewayProxyEventV2,
  APIGatewayRequestAuthorizerEvent,
} from "aws-lambda";
import { COOKIE_NAME, COOKIE_PASSWORD } from "../Config";
import Iron from "@hapi/iron";

export default async function getUserFromSession(
  event: APIGatewayProxyEventV2
) {
  if (!event.cookies || event.cookies.length == 0) {
    throw "NO COOKIES ERROR";
  }

  let allCookies = {};

  // Split all cookies into an object that is easier to use
  event.cookies.forEach((cookie) => {
    const splitCookie = cookie.trim().split("=");
    allCookies[splitCookie[0]] = splitCookie[1];
  });

  const cookie = allCookies[COOKIE_NAME];

  if (!cookie) {
    throw "MISSING COOKIES ERROR";
  }

  const user = await Iron.unseal(cookie, COOKIE_PASSWORD, Iron.defaults);
  return user;
}
