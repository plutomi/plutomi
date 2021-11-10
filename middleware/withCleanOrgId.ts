import { APIGatewayProxyEventV2 } from "aws-lambda";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

// Cleans up the org name (or ID technically) to be URL safe
export default function withCleanOrgId(handler: any) {
  return async (event: APIGatewayProxyEventV2) => {
    console.log("In middleware event", event);
    const { orgId } = event.pathParameters;
    console.log("Extracted org id", orgId);
    console.log("Generated ", tagGenerator.generate(orgId));
    event.pathParameters.orgId = tagGenerator.generate(orgId);

    console.log("new org id", event.pathParameters.orgId);
    return handler(event);
  };
}
