import { Request, Response } from "express";
import * as Orgs from "../../models/Orgs";
import * as CreateError from "../../utils/errorGenerator";
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { orgId } = req.params;

  const [invites, error] = await Orgs.GetInvitesForOrg({ orgId });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      "Unable to retrieve invites for org"
    );
    return res.status(status).json(body);
  }

  return res.status(200).json(invites);
};
export default main;
