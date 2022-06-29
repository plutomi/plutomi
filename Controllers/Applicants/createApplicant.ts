import { Request, Response } from 'express';
import Joi from 'joi';
import emailValidator from 'deep-email-validator';
import { DEFAULTS, ERRORS, JoiOrgId, JOI_SETTINGS, LIMITS, OpeningState } from '../../Config';
import * as CreateError from '../../utils/createError';
import { DynamoApplicant } from '../../types/dynamo';
import { DB } from '../../models';

export type APICreateApplicantOptions = Required<
  Pick<DynamoApplicant, 'orgId' | 'openingId' | 'email' | 'firstName' | 'lastName'>
>;
const schema = Joi.object({
  body: {
    orgId: JoiOrgId,
    openingId: Joi.string(),
    email: Joi.string().email(),
    firstName: Joi.string().invalid(DEFAULTS.FIRST_NAME).max(LIMITS.MAX_APPLICANT_FIRSTNAME_LENGTH),
    lastName: Joi.string().invalid(DEFAULTS.LAST_NAME).max(LIMITS.MAX_APPLICANT_LASTNAME_LENGTH),
  },
}).options(JOI_SETTINGS);

export const createApplicant = async (req: Request, res: Response) => {
  // TODO implement only one application per email
  // https://github.com/plutomi/plutomi/issues/521
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const emailValidation = await emailValidator({
    email: req.body.email,
    validateSMTP: false, // TODO BUG, this isnt working
  });

  if (!emailValidation.valid) {
    return res.status(400).json({
      message: ERRORS.EMAIL_VALIDATION,
    });
  }
  const { openingId, orgId, firstName, lastName, email } = req.body;

  const [opening, openingError] = await DB.Openings.getOpening({
    openingId,
    orgId,
  });

  if (openingError) {
    const { status, body } = CreateError.SDK(
      openingError,
      'An error ocurred getting your opening info',
    );
    return res.status(status).json(body);
  }

  if (!opening) {
    return res.status(404).json({ message: 'Opening does not exist' });
  }
  // Conditional check will also catch this
  if (opening.GSI1SK === OpeningState.PRIVATE || opening.totalStages === 0) {
    return res.status(403).json({ message: 'You cannot apply to this opening just yet!' });
  }
  const [created, failed] = await DB.Applicants.createApplicant({
    firstName,
    lastName,
    openingId,
    orgId,
    email,
    stageId: opening.stageOrder[0],
  });

  if (failed) {
    const { status, body } = CreateError.SDK(failed, 'An error ocurred creating your application');
    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: "We've sent you a link to your email to complete your application!",
  });
};
