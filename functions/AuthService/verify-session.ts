import { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from "aws-lambda";
import FormattedResponse from "../../utils/formatResponse";
import Iron from "@hapi/iron";
import { COOKIE_NAME } from "../../Config";
export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("INCOMING EVENT AUTH ROUTE", event);
  const password =
    "BEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANS";

  let allCookies = {};
  // Split all cookies into an object that is easier to use
  event.cookies.forEach((cookie) => {
    const splitCookie = cookie.trim().split("=");
    allCookies[splitCookie[0]] = splitCookie[1];
  });

  const cookie = allCookies[COOKIE_NAME];

  if (!cookie) {
    return FormattedResponse(401, {
      message: "Please sign in again (ERROR: Cookie is missing)",
    });
  }

  try {
    const unsealed = await Iron.unseal(cookie, password, Iron.defaults);
    console.log("UNSEALED", unsealed);

    return FormattedResponse(200, {
      message: `Your cookie is ${JSON.stringify(unsealed)}`,
    });
  } catch (error) {
    console.error(error);
    // TODO! handle expiration errors here
    // TODO delete cookies as is handled by iron already
    return FormattedResponse(500, {
      message: `Error verifying cookie - ${error}`,
    });
  }
}
