import { Request, Response } from 'express';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';
import { Applicant } from '../../entities/Applicants';

export const getApplicantById = async (req: Request, res: Response) => {
  const { applicantId } = req.params;
  const { user } = req;

  try {
    const applicants = await Applicant.findById({
      _id: applicantId,
      org: user.org,
    });
    return res.status(200).json(applicants);
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving applicants' });
  }
};
