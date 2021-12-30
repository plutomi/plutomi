import { APIGatewayProxyResultV2 } from "aws-lambda";

interface Cookie {
  name: string;
  value: string;
  secure: boolean;
  httpOnly: boolean;
}

export default function formatResponse(
  statusCode: number,
  body: {},
  cookie?: Cookie
) {
  let responseCookie: string;
  if (cookie) {
    responseCookie = `${cookie.name}=${cookie.value};`;

    if (cookie.secure) {
      responseCookie += " Secure;";
    }

    if (cookie.httpOnly) {
      responseCookie += " httpOnly;";
    }
  }

  const response: APIGatewayProxyResultV2 = {
    body: JSON.stringify(body),
    cookies: responseCookie ? [responseCookie] : null,
    statusCode: statusCode, // TODO shorten this
  };

  return response;
}
