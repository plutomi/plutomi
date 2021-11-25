import { NextApiRequest, NextApiResponse } from "next";
import withCleanOrgId from "../../../middleware/withCleanOrgId";
import { getOrgInvitesForUser } from "../../../utils/invites/getOrgInvitesForUser";
import { withSessionRoute } from "../../../middleware/withSession";
import { createAndJoinOrg } from "../../../utils/orgs/createAndJoinOrg";
import { API_METHODS, DEFAULTS } from "../../../Config";
import withAuth from "../../../middleware/withAuth";
import withValidMethod from "../../../middleware/withValidMethod";
import Joi from "joi";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method } = req;
  const { GSI1SK, orgId } = body;

  // Create an org
  if (method === API_METHODS.POST) {
    if (req.session.user.orgId != DEFAULTS.NO_ORG) {
      return res.status(400).json({
        message: `You already belong to an org!`,
      });
    }

    const pendingInvites = await getOrgInvitesForUser({
      userId: req.session.user.userId,
    });

    if (pendingInvites && pendingInvites.length) {
      return res.status(403).json({
        message:
          "You seem to have pending invites, please accept or reject them before creating an org :)", // TODO error enum
      });
    }

    const createOrgInput = {
      GSI1SK: GSI1SK,
      orgId: orgId,
      user: req.session.user,
    };

    const schema = Joi.object({
      orgId: Joi.string()
        .min(1)
        .invalid(DEFAULTS.NO_ORG, tagGenerator.generate(DEFAULTS.NO_ORG)),
      GSI1SK: Joi.string()
        .min(1)
        .invalid(DEFAULTS.NO_ORG, tagGenerator.generate(DEFAULTS.NO_ORG)),
      user: Joi.object(),
    }).options({ presence: "required" });

    // Validate input
    try {
      await schema.validateAsync(createOrgInput);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    try {
      await createAndJoinOrg({
        userId: req.session.user.userId,
        orgId: orgId,
        GSI1SK: GSI1SK,
      });

      // Update the logged in user session with the new org id
      req.session.user.orgId = orgId;
      await req.session.save();

      return res.status(201).json({ message: "Org created!", org: orgId });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }
};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [API_METHODS.POST])
);
