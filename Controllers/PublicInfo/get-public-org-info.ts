import { Request, Response } from "express";
import * as Orgs from "../../models/Orgs";
import * as CreateError from "../../utils/errorGenerator";
import { pick } from "lodash";
const main = async (req: Request, res: Response) => {
  const { orgId } = req.params;

  const [org, orgError] = await Orgs.getOrgById({ orgId });

  if (orgError) {
    const { status, body } = CreateError.SDK(
      orgError,
      "Unable to retrieve org info"
    );
    return res.status(status).json(body);
  }

  if (!org) {
    return res.status(404).json({ message: "Org not found" });
  }

  const modifiedOrg = pick(org, ["orgId", "displayName"]);
  return res.status(200).json(modifiedOrg);
};
export default main;
