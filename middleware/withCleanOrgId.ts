import middy from "@middy/core";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
  APIGatewayProxyResult,
} from "aws-lambda";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

const middleware = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const before: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult
  > = async (request) => {
    // TODO types
    // @ts-ignore
    if (request.event?.body?.orgId) {
      // @ts-ignore
      request.event.body.orgId = tagGenerator.generate(
        // @ts-ignore
        request.event.body.orgId
      );
    }


    if (request.event?.pathParameters?.orgId) {

      // @ts-ignore
      request.event.pathParameters.orgId = tagGenerator.generate(
        request.event.pathParameters.orgId
      );
    }

    if (request.event?.queryStringParameters?.orgId) {
      request.event.queryStringParameters.orgId = tagGenerator.generate(
        request.event.queryStringParameters.orgId
      );
    }
  };

  const after: middy.MiddlewareFn<
    APIGatewayProxyEvent, // TODO types
    APIGatewayProxyResult
  > = async (request): Promise<void> => {
    // Your middleware logic
  };

  return {
    before,
    after,
  };
};

export default middleware;
