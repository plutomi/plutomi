import middy from "@middy/core";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
  APIGatewayProxyResult,
} from "aws-lambda";
import { AUTH_ERRORS, COOKIE_NAME, COOKIE_SETTINGS } from "../Config";
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
      let message =
        sessionError === AUTH_ERRORS.SESSION_EXPIRED
          ? "Your session has expired, please log in again"
          : "Please log in again";
      /**
       *  Returning from a Middy middleware cancels the request so we have to return here
       */
      request.response = {
        statusCode: 401,
        // @ts-ignore // TODO types, needs V2 result
        cookies: [`${COOKIE_NAME}=''; Max-Age=-1; ${COOKIE_SETTINGS}`],
        body: JSON.stringify({ message: message }),
        headers: {
          "Content-Type": "application/json",
        },
      };
      console.log("Modified request", request);
      return request.response;
    }

    request.event["session"] = session;
    console.log("Added session to event");
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
