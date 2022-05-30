import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../../utils/createError';
import { JOI_GLOBAL_FORBIDDEN, JOI_SETTINGS, OpeningState, LIMITS } from '../../../Config';
import { DynamoOpening } from '../../../types/dynamo';
import { UpdateOpeningInput } from '../../../models/Openings/UpdateOpening';
import { getOpening, updateOpening } from '../../../models/Openings';

export interface APIUpdateOpeningOptions
  extends Partial<Pick<DynamoOpening, 'openingName' | 'GSI1SK' | 'stageOrder'>> {
  [key: string]: any;
}

const JOI_FORBIDDEN_OPENING = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  openingId: Joi.any().forbidden(),
  GSI1PK: Joi.any().forbidden(),
  totalStages: Joi.any().forbidden(),
  totalApplicants: Joi.any().forbidden(),
  stageOrder: Joi.array().items(Joi.string()).optional(),
  openingName: Joi.string().max(LIMITS.MAX_OPENING_NAME_LENGTH).optional(),
  GSI1SK: Joi.string().valid(OpeningState.PUBLIC, OpeningState.PRIVATE).optional(),
});

const schema = Joi.object({
  body: JOI_FORBIDDEN_OPENING,
}).options(JOI_SETTINGS);

export const main = async (req: Request, res: Response) => {
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

  const [opening, openingError] = await getOpening({
    orgId: session.orgId,
    openingId,
  });

  if (openingError) {
    const { status, body } = CreateError.SDK(
      openingError,
      "An error ocurred retrieving this opening's info",
    );
    return res.status(status).json(body);
  }

  if (!opening) {
    return res.status(404).json({ message: 'Opening not found' });
  }

  if (req.body.stageOrder) {
    if (req.body.stageOrder.length !== opening.stageOrder.length) {
      return res.status(403).json({
        message:
          'You cannot add / delete stages this way, please use the proper API methods for those actions',
      });
    }

    // Check if the IDs have been modified
    // TODO add a test for this
    const containsAll = opening.stageOrder.every((stageId) =>
      req.body.stageOrder.includes(stageId),
    );

    if (!containsAll) {
      return res.status(400).json({
        message:
          "The stageIds in the 'stageOrder' property differ from the ones in the opening, please check your request and try again.",
      });
    }
  }

  // TODO i think this can be moved into dynamo
  if (req.body.GSI1SK === OpeningState.PUBLIC && opening.totalStages === 0) {
    return res.status(403).json({
      message: 'An opening needs to have stages before being made public',
    });
  }
  const [updatedOpening, error] = await updateOpening(updateOpeningInput);

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred updating this opening');

    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: 'Opening updated!',
  });
};
