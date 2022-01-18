import * as Openings from "../../models/Openings";
import * as Stages from "../../models/Stages";
import * as Applicants from "../../models/Applicants";
import emailValidator from "deep-email-validator";

import middy from "@middy/core";
import Joi from "joi";
import {
  JOI_SETTINGS,
  DEFAULTS,
  withDefaultMiddleware,
  JOI_GLOBAL_FORBIDDEN,
  JoiOrgId,
} from "../../Config";
import { CustomLambdaEvent, CustomLambdaResponse } from "../../types/main";
import * as Response from "../../utils/customResponse";
interface APICreateApplicantsBody {
  orgId: string;
  openingId: string;
  firstName: string;
  lastName: string;
  email: string;
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
    firstName: Joi.string().invalid(DEFAULTS.FIRST_NAME),
    lastName: Joi.string().invalid(DEFAULTS.FIRST_NAME),
  },
}).options(JOI_SETTINGS);

// TODO implement only one application per email
const main = async (
  event: APICreateApplicantsEvent
): Promise<CustomLambdaResponse> => {
  try {
    await schema.validateAsync(event);
  } catch (error) {
    return Response.JOI(error);
  }

  const res = await emailValidator(event.body.email);

  if (!res.valid) {
    return {
      statusCode: 400,
      body: {
        message: "Hmm... that email doesn't seem quite right. Check it again.",
      },
    };
  }
  const { openingId, orgId, firstName, lastName, email } = event.body;

  const [opening, getOpeningError] = await Openings.getOpeningById({
    orgId,
    openingId,
  });
  if (getOpeningError) {
    return Response.SDK(
      getOpeningError,
      "An error ocurred retrieving the info for this opening"
    );
  }

  if (!opening) {
    return {
      statusCode: 404,
      body: { message: "Unfortunately that opening does not exist" },
    };
  }

  if (!opening.isPublic || opening.totalStages === 0) {
    return {
      statusCode: 403,
      body: {
        message: "Unfortunately you cannot apply to this opening just yet",
      },
    };
  }

  const [allStages, allStagesError] = await Openings.getStagesInOpening({
    openingId,
    orgId,
  });

  if (allStagesError) {
    return Response.SDK(
      allStagesError,
      "An error ocurred retrieving stages for this opening"
    );
  }

  const [created, failed] = await Applicants.createApplicant({
    firstName,
    lastName,
    openingId,
    orgId,
    email,
    stageId: allStages[0].stageId,
  });

  if (failed) {
    return Response.SDK(failed, "An error ocurred creating your application");
  }

  return {
    statusCode: 201,
    body: { message: "We've created your application! Check your email." },
  };
};

// TODO types with API Gateway event and middleware
// @ts-ignore
module.exports.main = middy(main).use(withDefaultMiddleware);
