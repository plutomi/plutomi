import middy from "@middy/core";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
  APIGatewayProxyResult,
} from "aws-lambda";
import { COOKIE_NAME, COOKIE_SETTINGS } from "../Config";
import getSessionFromCookies from "../utils/getSessionFromCookies";

const middleware = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const before: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult
  > = async (request) => {
    // Your middleware logic
    console.log("In middleware lambda, request: ", request);
    const [session, sessionError] = await getSessionFromCookies(request.event);
    console.log("Session info:", session, sessionError);
    if (sessionError) {
      console.log("Session error");
      /**
       *  Returning from a Middy middleware cancels the reuest
       *  we need to return a JSON.stringified body here as the response middleware to format
       *  the body never gets to run
       */
      request.response = {
        statusCode: 401,
        // @ts-ignore // TODO types, needs V2 result
        cookies: [`${COOKIE_NAME}=''; Max-Age=-1; ${COOKIE_SETTINGS}`],
        body: JSON.stringify({ message: "Please log in again" }),
      };
      console.log(request);
      return request.response;
    }

    // TODO gotta figure out middy middleware to auto reject and set cookies
    // But i think setting session to undefined is fine, TODO cleanup
    session
      ? (request.event["session"] = session)
      : (request.event["session"] = undefined);
    // TODO add this to lambda type
    console.log("New event", request);
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
