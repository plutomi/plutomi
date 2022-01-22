import { Request, Response } from "express";
import * as CreateError from "../../utils/errorGenerator";
import * as Openings from "../../models/Openings";
import { pick } from "lodash";
const main = async (req: Request, res: Response) => {
  const { orgId } = req.params;

  const [openings, openingsError] = await Openings.GetOpeningsInOrg({
    orgId,
    GSI1SK: "PUBLIC",
  });

  if (openingsError) {
    const { status, body } = CreateError.SDK(
      openingsError,
      "An error ocurred retrieving openings for this org"
    );
    return res.status(status).json(body);
  }

  const modifiedOpenings = openings.map((opening) =>
    pick(opening, ["openingName", "createdAt", "openingId"])
  );

  return res.status(200).json(modifiedOpenings);
};
export default main;
