import { getUserById } from "../utils/users/getUserById";
import { Request, Response } from "express";
export const self = async (req: Request, res: Response) => {
  try {
    const requestedUser = await getUserById({
      userId: req.session.user.userId,
    });
    if (!requestedUser) {
      req.session.destroy();
      return res.status(401).json({
        message: `Please log in again`,
      }); // TODO enum error
    }

    return res.status(200).json(req.session.user);
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `${error}` });
  }
};
