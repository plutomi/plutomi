import { Request, Response } from 'express';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';

export const getApplicantsInStage = async (req: Request, res: Response) => {
  const { openingId, stageId } = req.params;
  const { user } = req;

  const [applicants, applicantsError] = await DB.Applicants.getApplicantsInStage({
    orgId: user.orgId,
    openingId,
    stageId,
  });

  if (applicantsError) {
    const { status, body } = CreateError.SDK(
      applicantsError,
      'An error ocurred retrieving applicants',
    );

    return res.status(status).json(body);
  }

  return res.status(200).json(applicants);
};
