import { Request, Response } from "express";
import { DEFAULTS } from "../../Config";
import * as Orgs from "../../models/Orgs";
import * as CreateError from "../../utils/errorGenerator";
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;

  if (session.orgId === DEFAULTS.NO_ORG || session.orgId === DEFAULTS.NO_ORG) {
    return res
      .status(403)
      .json({ message: "You must create or join an org to view it's details" });
  }

  const [org, error] = await Orgs.getOrgById({ orgId: session.orgId });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      "Unable to retrieve org info"
    );

    return res.status(status).json(body);
  }

  // Not sure how this would be possible but :)
  if (!org) {
    return res.status(404).json({ message: "Org not found" });
  }

  return res.status(200).json(org);
};
export default main;
