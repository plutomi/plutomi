import { Request, Response } from 'express';
import * as CreateError from '../../../utils/createError';
import { getApplicantsInStage } from '../../../models/Applicants/GetApplicantsInStage';

export const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { openingId, stageId } = req.params;

  const [applicants, applicantsError] = await getApplicantsInStage({
    orgId: session.orgId,
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
