import { Request, Response } from "express";
import { DEFAULTS, JOI_SETTINGS, JoiOrgId } from "../../Config";
import * as CreateError from "../../utils/errorGenerator";
import * as Users from "../../models/Users";
import * as Orgs from "../../models/Orgs";
import Joi from "joi";

interface APICreateOrgBody {
  orgId?: string;
  displayName?: string;
}

const schema = Joi.object({
  body: {
    orgId: JoiOrgId,
    displayName: Joi.string(),
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

  if (session.orgId !== DEFAULTS.NO_ORG) {
    return res.status(403).json({ message: "You already belong to an org!" });
  }

  const [pendingInvites, error] = await Users.getInvitesForUser({
    userId: session.userId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      "Unable to create org - error retrieving invites"
    );

    return res.status(status).json(body);
  }

  if (pendingInvites && pendingInvites.length > 0) {
    return res.status(403).json({
      message:
        "You seem to have pending invites, please accept or reject them before creating an org :)",
    });
  }

  const { displayName, orgId }: APICreateOrgBody = req.body;

  const [created, failed] = await Orgs.createAndJoinOrg({
    userId: session.userId,
    orgId,
    displayName,
  });

  if (failed) {
    const { status, body } = CreateError.SDK(failed, "Unable to create org");
    return res.status(status).json(body);
  }

  return res.status(201).json({ message: "Org created!" });
};
export default main;
