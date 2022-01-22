import { Request, Response } from "express";
import * as Users from "../../models/Users";
import * as CreateError from "../../utils/errorGenerator";
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const [invites, error] = await Users.GetInvitesForUser({
    userId: session.userId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      "An error ocurred retrieving invites"
    );
    return res.status(status).json(body);
  }

  return res.status(200).json(invites);
};
export default main;
