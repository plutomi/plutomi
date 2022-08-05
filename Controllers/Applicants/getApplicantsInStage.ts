import { Request, Response } from 'express';
import * as CreateError from '../../utils/createError';
import { DB } from '../../models';
import { Applicant } from '../../entities/Applicants';

export const getApplicantsInStage = async (req: Request, res: Response) => {
  const { openingId, stageId } = req.params;
  const { user } = req;

  try {
    const applicants = await Applicant.find({
      org: user.org,
      openingId,
      stageId,
    }).limit(200);
    return res.status(200).json(applicants);
  } catch (error) {
    return res.status(500).json({ message: 'An error ocurred retrieving applicants' });
  }
};
