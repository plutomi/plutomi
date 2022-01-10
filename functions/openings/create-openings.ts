import * as Openings from "../../models/Openings";
import middy from "@middy/core";
import Joi from "joi";
import { JOI_SETTINGS, DEFAULTS, withSessionMiddleware } from "../../Config";
import createJoiResponse from "../../utils/createJoiResponse";
import createSDKErrorResponse from "../../utils/createSDKErrorResponse";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

interface APICreateOpeningsBody {
  GSI1SK?: string;
}
interface APICreateOpeningsEvent extends Omit<CustomLambdaEvent, "body"> {
  body: APICreateOpeningsBody;
}

const schema = Joi.object({
  body: {
    GSI1SK: Joi.string().max(100),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: APICreateOpeningsEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return createJoiResponse(error);
  }

  const { GSI1SK } = event.body;
  const { session } = event;
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

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withSessionMiddleware);
