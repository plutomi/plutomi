import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import * as Openings from "../../models/Openings";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";
import httpResponseSerializer from "@middy/http-response-serializer";
import Joi from "joi";
import {
  NO_SESSION_RESPONSE,
  JOI_SETTINGS,
  DEFAULTS,
  TIME_UNITS,
  MIDDY_SERIALIZERS,
} from "../../Config";
import getSessionFromCookies from "../../utils/getSessionFromCookies";
import createJoiResponse from "../../utils/createJoiResponse";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent } from "../../types/main";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();
const schema = Joi.object({
  body: {
    GSI1SK: Joi.string().max(100),
  },
}).options(JOI_SETTINGS);

interface APICreateOpeningsBody {
  GSI1SK?: string;
}
interface APICreateOpeningsEvent extends Omit<CustomLambdaEvent, "body"> {
  body: APICreateOpeningsBody;
}

const main = async (event: APICreateOpeningsEvent) => {
  const [session, sessionError] = await getSessionFromCookies(event);
  console.log({
    session,
    sessionError,
  });
  if (sessionError) {
    return NO_SESSION_RESPONSE;
  }

  try {
    await schema.validateAsync(event);
  } catch (error) {
    return createJoiResponse(error);
  }

  const { GSI1SK } = event.body;

  if (session.orgId === DEFAULTS.NO_ORG) {
    return {
      statusCode: 400,
      body: {
        message: `You must create an organization before creating openings`,
      },
    };
  }

  const [created, createOpeningError] = await Openings.createOpening({
    orgId: session.orgId,
    GSI1SK,
  });

  if (createOpeningError) {
    return createSDKErrorResponse(
      createOpeningError,
      "An error ocurred creating opening"
    );
  }

  return {
    statusCode: 201,
    body: { message: "Opening created!" },
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpResponseSerializer(MIDDY_SERIALIZERS));
