import { Request, Response } from "express";
import { DEFAULTS, JOI_SETTINGS } from "../../Config";
import * as CreateError from "../../utils/errorGenerator";
import * as Openings from "../../models/Openings";
import Joi from "joi";

interface APICreateOpeningsBody {
  openingName?: string;
}

const schema = Joi.object({
  body: {
    openingName: Joi.string().max(100),
  },
}).options(JOI_SETTINGS);

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { openingName }: APICreateOpeningsBody = req.body;

  const [created, createOpeningError] = await Openings.CreateOpening({
    orgId: session.orgId,
    openingName,
  });

  if (createOpeningError) {
    const { status, body } = CreateError.SDK(
      createOpeningError,
      "An error ocurred creating opening"
    );
    return res.status(status).json(body);
  }

  return res.status(201).json({ message: "Opening created!" });
};
export default main;
