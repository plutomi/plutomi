import { Request, Response } from 'express';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';

export const getApplicantById = async (req: Request, res: Response) => {
  const { applicantId } = req.params;
  const { user } = req;

  const [applicant, error] = await DB.Applicants.getApplicant({
    orgId: user.orgId,
    applicantId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      "An error ocurred retrieving this applicant's info",
    );
    return res.status(status).json(body);
  }
  if (!applicant) {
    return res.status(404).json({ message: 'Applicant not found' });
  }
  return res.status(200).json(applicant);
};
