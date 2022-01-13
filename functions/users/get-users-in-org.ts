import * as Orgs from "../../models/Orgs";
import { DEFAULTS, withDefaultMiddleware } from "../../Config";
import middy from "@middy/core";
import Sanitize from "../../utils/sanitize";
import * as Response from "../../utils/customResponse";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";

const main = async (
  event: CustomLambdaEvent
): Promise<CustomLambdaResponse> => {
  const { session } = event.requestContext.authorizer.lambda;
  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 200,
      body: {
        message: "You must create an org or join one to view it's users",
      },
    };
  }

  const [users, error] = await Orgs.getUsersInOrg({
    orgId: session.orgId,
  });

  if (error) {
    return Response.SDK(
      error,
      "An error ocurred getting the users in your org"
    );
  }

  const cleanUsers = users.map(
    (user) =>
      Sanitize(
        "KEEP",
        ["userId", "orgId", "firstName", "lastName", "email", "orgJoinDate"],
        user
      ).object
  );
  return {
    statusCode: 200,
    body: cleanUsers,
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
