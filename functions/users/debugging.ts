const cookie = require("cookie-signature");
import * as Users from "../../models/Users";
import {
  COOKIE_NAME,
  COOKIE_SETTINGS,
  withDefaultMiddleware,
  withSessionMiddleware,
} from "../../Config";
import middy from "@middy/core";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
const main = async (
  event: CustomLambdaEvent // TODO create type
): Promise<CustomLambdaResponse> => {
  const cookieSignature = "c3np198hed923hu";
  const userData = "jose";
  let val = cookie.sign(userData, cookieSignature);
  console.log("Signed value:", val);

  try {
    cookie.unsign(val, cookieSignature).should.equal(userData);
  } catch (error) {
    console.error("Error getting cookiedata", error);
  }

  const unsigned = cookie.unsign(val, cookieSignature);

  console.log("Unsigned", unsigned);

  const invalid = cookie.unsign(val, "a");
  console.log("invalid", invalid);

  const obj = JSON.stringify({
    userId: "fn2iun",
    expires: "e9238hj3",
  });

  const signedObj = cookie.sign(obj, cookieSignature);
  console.log("Signed object", signedObj);

  const unsignedObj = cookie.unsign(obj, "123");
  console.log("invalid object", unsignedObj);

  return {
    statusCode: 200,
    body: event,
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
