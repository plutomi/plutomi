import { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from "aws-lambda";
import FormattedResponse from "../../utils/formatResponse";
import { nanoid } from "nanoid";
import Iron from "@hapi/iron";
import { COOKIE_NAME, COOKIE_DURATION } from "../../Config";
const user = {
  id: nanoid(50),
  age: 12,
  orgId: "beans",
};

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("INCOMING EVENT AUTH ROUTE", event);
  const password =
    "BEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANSBEANS BEANS BEANS";

  // TODO! major, check if user already has a session
  // TODO!
  try {
    const cookie = await Iron.seal(user, password, {
      ...Iron.defaults,
      ttl: COOKIE_DURATION,
    });

    return FormattedResponse(
      200,
      { message: "Yea" },
      { "Set-Cookie": `${COOKIE_NAME}=${cookie}; Secure; HttpOnly;` }
    );
  } catch (error) {
    return FormattedResponse(500, {
      message: `Error creating seal - ${error}`,
    });
  }
}
