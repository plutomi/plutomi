import { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from "aws-lambda";
import FormattedResponse from "../../utils/formatResponse";
import { nanoid } from "nanoid";
import Iron from "@hapi/iron";
import { COOKIE_NAME, COOKIE_DURATION, COOKIE_PASSWORD } from "../../Config";
const user = {
  id: nanoid(50),
  age: 12,
  orgId: "beans",
};

const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  //
  try {
    const cookie = await Iron.seal(user, COOKIE_PASSWORD, {
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
};

export default handler;
