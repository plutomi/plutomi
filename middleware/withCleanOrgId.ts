import { APIGatewayProxyEventV2 } from "aws-lambda";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

// Cleans up the org name (or ID technically) to be URL safe
export default function withCleanOrgId(handler: any) {
  return async (event: APIGatewayProxyEventV2) => {
    const { orgId } = event.pathParameters;
    event.pathParameters.orgId = tagGenerator.generate(orgId);
    return handler(event);
  };
}
