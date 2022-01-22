import { Request, Response } from "express";
import * as Openings from "../../models/Openings";
import * as CreateError from "../../utils/createError";
import * as Stages from "../../models/Stages";
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;

  const { openingId } = req.params;

  const [opening, openingError] = await Openings.GetOpeningById({
    openingId,
    orgId: session.orgId,
  });
  console.log("Opening id", openingId);

  if (openingError) {
    const { status, body } = CreateError.SDK(
      openingError,
      "An error ocurred getting your opening info"
    );
    return res.status(status).json(body);
  }
  const [allCurrentStages, allStagesError] = await Stages.GetStagesInOpenings({
    openingId,
    orgId: session.orgId,
    stageOrder: opening.stageOrder, // To order them correctly
  });

  if (allStagesError) {
    console.log("All stages error", allStagesError);
    const { status, body } = CreateError.SDK(
      allStagesError,
      "An error ocurred retrieving all the current stages"
    );

    return res.status(status).json(body);
  }

  return res.status(200).json(allCurrentStages);
};
export default main;
