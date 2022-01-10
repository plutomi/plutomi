import { COOKIE_NAME, COOKIE_SETTINGS, MIDDY_SERIALIZERS } from "../../Config";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";
// TODO create logoout event in Dynamo

const main = async (event) => {
  return {
    statusCode: 200,
    cookies: [`${COOKIE_NAME}=''; Max-Age=-1; ${COOKIE_SETTINGS}`],
    body: { message: "You've succesfully logged out!" },
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpResponseSerializer(MIDDY_SERIALIZERS));
