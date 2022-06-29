import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { JOI_SETTINGS, OpeningState, LIMITS } from '../../Config';
import { DB } from '../../models';
import { DynamoOpening } from '../../types/dynamo';

const schema = Joi.object({
  stageOrder: Joi.array().items(Joi.string()),
  openingName: Joi.string().max(LIMITS.MAX_OPENING_NAME_LENGTH),
  GSI1SK: Joi.string().valid(OpeningState.PUBLIC, OpeningState.PRIVATE),
}).options(JOI_SETTINGS);

export interface APIUpdateOpeningOptions
  extends Partial<Pick<DynamoOpening, 'openingName' | 'GSI1SK' | 'stageOrder'>> {}

export const updateOpening = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  let updatedValues: APIUpdateOpeningOptions = {};
  const { user } = req;
  const { openingId } = req.params;

  const [opening, openingError] = await DB.Openings.getOpening({
    orgId: user.orgId,
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

    updatedValues.stageOrder = req.body.stageOrder;
  }
  // Public or private
  if (req.body.GSI1SK) {
    // TODO i think this can be moved into dynamo
    if (req.body.GSI1SK === OpeningState.PUBLIC && opening.totalStages === 0) {
      return res.status(403).json({
        message: 'An opening needs to have stages before being made public',
      });
    }

    updatedValues.GSI1SK = req.body.GSI1SK;
  }

  if (req.body.openingName) {
    updatedValues.openingName = req.body.openingName;
  }

  const [updatedOpening, error] = await DB.Openings.updateOpening({
    orgId: user.orgId,
    openingId: req.params.openingId,
    updatedValues,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred updating this opening');

    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: 'Opening updated!',
  });
};
