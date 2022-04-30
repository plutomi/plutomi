import { Request, Response } from 'express';
import * as CreateError from '../../utils/createError';
import * as Applicants from '../../models/Applicants';
import * as Openings from '../../models/Openings';

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { openingId, stageId } = req.params;

  const [applicants, applicantsError] = await Applicants.GetApplicantsInStage({
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
export default main;
