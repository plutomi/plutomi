import { Request, Response } from "express";
import { getAllOpeningsInOrg } from "../utils/openings/getAllOpeningsInOrg";

export const getAllOpenings = async (req: Request, res: Response) => {
  try {
    const allOpenings = await getAllOpeningsInOrg({
      orgId: req.session.user.orgId,
    });
    return res.status(200).json(allOpenings);
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to retrieve openings: ${error}` });
  }
};
