import { Request, Response } from "express";
import Joi from "joi";
import * as Openings from "../../models/Openings";
import * as CreateError from "../../utils/createError";
import {
  JOI_GLOBAL_FORBIDDEN,
  JOI_SETTINGS,
  OPENING_STATE,
} from "../../Config";
import { UpdateOpeningInput } from "../../types/main";
import { DynamoNewOpening } from "../../types/dynamo";

export type APIUpdateOpeningOptions = Partial<
  Pick<DynamoNewOpening, "openingName" | "GSI1SK" | "stageOrder">
>;

const JOI_FORBIDDEN_OPENING = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  openingId: Joi.any().forbidden(),
  GSI1PK: Joi.any().forbidden(),
  totalStages: Joi.any().forbidden(),
  totalApplicants: Joi.any().forbidden(),
  GSI1SK: Joi.string()
    .valid(OPENING_STATE.PUBLIC, OPENING_STATE.PRIVATE)
    .optional(),
});

const schema = Joi.object({
  body: JOI_FORBIDDEN_OPENING,
}).options(JOI_SETTINGS);

const main = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { session } = res.locals;
  const { openingId } = req.params;

  const updateOpeningInput: UpdateOpeningInput = {
    openingId,
    orgId: session.orgId,
    newValues: req.body,
  };

  const [opening, openingError] = await Openings.GetOpeningById({
    orgId: session.orgId,
    openingId,
  });

  if (openingError) {
    const { status, body } = CreateError.SDK(
      openingError,
      "An error ocurred retrieving this opening's info"
    );
    return res.status(status).json(body);
  }

  // TODO add this to updating stages with question and rule orders as well
  // https://github.com/plutomi/plutomi/issues/529
  if (
    req.body.stageOrder &&
    req.body.stageOrder.length != opening.stageOrder.length
  ) {
    return res.status(403).json({
      message:
        "You cannot add / delete stages this way, please use the proper API methods for those actions",
    });
  }

  // TODO i think this can be moved into dynamo
  if (req.body.GSI1SK === OPENING_STATE.PUBLIC && opening.totalStages === 0) {
    return res.status(403).json({
      message: "An opening needs to have stages before being made public",
    });
  }
  const [updatedOpening, error] = await Openings.UpdateOpening(
    updateOpeningInput
  );

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      "An error ocurred updating this opening"
    );

    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: "Opening updated!",
  });
};

export default main;
