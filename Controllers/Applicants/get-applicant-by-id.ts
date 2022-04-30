import { Request, Response } from 'express';
import * as CreateError from '../../utils/createError';
import * as Applicants from '../../models/Applicants';
import session from 'express-session';

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { applicantId } = req.params;

  // TODO gather child items here
  const [applicant, error] = await Applicants.GetApplicantById({
    orgId: session.orgId,
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
export default main;
