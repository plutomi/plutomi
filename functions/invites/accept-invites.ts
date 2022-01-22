import middy from "@middy/core";
import Joi from "joi";
import { JOI_SETTINGS, DEFAULTS, TIME_UNITS } from "../../Config";
import * as Invites from "../../models/Invites";
import * as Time from "../../utils/time";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";

const schema = Joi.object({
  pathParameters: {
    inviteId: Joi.string(),
  },
}).options(JOI_SETTINGS);

const main = async (
  event: CustomLambdaEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return CreateError.JOI(error);
  }


};
// TODO types with API Gateway event and middleware
// @ts-ignore
