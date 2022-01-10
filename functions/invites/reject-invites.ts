import Joi from "joi";
import * as Invites from "../../models/Invites";
import {
  JOI_SETTINGS,
  MIDDY_SERIALIZERS,
} from "../../Config";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import inputOutputLogger from "@middy/input-output-logger";
import middy from "@middy/core";
import createJoiResponse from "../../utils/createJoiResponse";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";

interface APIRejectInvitesPathParameters {
  inviteId?: string;
}
interface APIRejectInvitesEvent
  extends Omit<CustomLambdaEvent, "pathParameters"> {
  pathParameters: APIRejectInvitesPathParameters;
}

const schema = Joi.object({
  pathParameters: {
    inviteId: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APIRejectInvitesEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return createJoiResponse(error);
  }

  const { inviteId } = event.pathParameters;
  const { session } = event;

  const [deleted, error] = await Invites.deleteInvite({
    inviteId,
    userId: session.userId,
  });

  if (error) {
    return createSDKErrorResponse(
      error,
      "We were unable to reject that invite"
    );
  }

  return {
    statusCode: 200,
    body: { message: "Invite rejected!" },
  };
};

module.exports.main = middy(main)
  .use(httpEventNormalizer({ payloadFormatVersion: 2 }))
  .use(httpJsonBodyParser())
  .use(inputOutputLogger())
  .use(httpResponseSerializer(MIDDY_SERIALIZERS));
