import { Request, Response } from "express";
import * as Orgs from "../../models/Orgs";
import * as Openings from "../../models/Openings";
import * as CreateError from "../../utils/createError";
import { pick } from "lodash";
import { OPENING_STATE } from "../../Config";
const main = async (req: Request, res: Response) => {
  const { orgId, openingId } = req.params;

  const [opening, openingsError] = await Openings.GetOpeningById({
    orgId,
    openingId,
  });

  if (openingsError) {
    const { status, body } = CreateError.SDK(
      openingsError,
      "An error ocurred retrieving this opening's info"
    );
    return res.status(status).json(body);
  }

  if (opening.GSI1SK === OPENING_STATE.PRIVATE) {
    return res
      .status(403)
      .json({ message: "You cannot view this opening at this time" });
  }

  const modifiedOpening = pick(opening, [
    "openingName",
    "createdAt",
    "openingId",
  ]);

  return res.status(200).json(modifiedOpening);
};
export default main;
