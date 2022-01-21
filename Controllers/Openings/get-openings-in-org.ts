import { Request, Response } from "express";
import * as CreateError from "../../utils/errorGenerator";
import * as Orgs from "../../models/Orgs";
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const [openings, openingsError] = await Orgs.getOpeningsInOrg({
    orgId: session.orgId,
  });

  if (openingsError) {
    const { status, body } = CreateError.SDK(
      openingsError,
      "An error ocurred retrieving openings"
    );

    return res.status(status).json(body);
  }

  return res.status(200).json(openings);
};
export default main;
