import * as Openings from "../../models/Openings";
import * as Stages from "../../models/Stages";
import * as Applicants from "../../models/Applicants";
import emailValidator from "deep-email-validator";

import middy from "@middy/core";
import Joi from "joi";
import {
  JOI_SETTINGS,
  DEFAULTS,
  JOI_GLOBAL_FORBIDDEN,
  JoiOrgId,
} from "../../Config";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as CreateError from "../../utils/errorGenerator";
interface APICreateApplicantsBody {
  orgId: string;
  openingId: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string; // bot honeypot // TODO
}
interface APICreateApplicantsEvent extends Omit<CustomLambdaEvent, "body"> {
  body: APICreateApplicantsBody;
}

const schema = Joi.object({
  body: {
    ...JOI_GLOBAL_FORBIDDEN,
    orgId: JoiOrgId, // Can't be default org
    openingId: Joi.string(),
    email: Joi.string().email(),
    firstName: Joi.string().invalid(DEFAULTS.FIRST_NAME).max(20),
    lastName: Joi.string().invalid(DEFAULTS.FIRST_NAME).max(20),
    username: Joi.string().optional().forbidden(),
  },
}).options(JOI_SETTINGS);

// TODO implement only one application per email
const main = async (
  event: APICreateApplicantsEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return CreateError.JOI(error);
  }
  const res = await emailValidator({
    email: event.body.email,
    validateSMTP: false, // BUG, this isnt working
  });

  if (!res.valid) {
    return {
      statusCode: 400,
      body: {
        message: "Hmm... that email doesn't seem quite right. Check it again.",
      },
    };
  }
  const { openingId, orgId, firstName, lastName, email } = event.body;

  const [opening, openingError] = await Openings.getOpeningById({
    openingId,
    orgId,
  });

  if (openingError) {
    return CreateError.SDK(
      openingError,
      "An error ocurred getting your opening info"
    );
  }

  if (!opening) {
    return {
      statusCode: 404,
      body: { message: "Opening does not exist" },
    };
  }
  // Conditional check will also catch this
  if (!opening.isPublic || opening.totalStages === 0) {
    return {
      statusCode: 403,
      body: {
        message: "You cannot apply to this opening just yet!",
      },
    };
  }

  const [created, failed] = await Applicants.createApplicant({
    firstName,
    lastName,
    openingId,
    orgId,
    email,
    stageId: opening.stageOrder[0],
  });

  if (failed) {
    return CreateError.SDK(
      failed,
      "An error ocurred creating your application"
    );
  }

  return {
    statusCode: 201,
    body: { message: "We've created your application! Check your email." },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
