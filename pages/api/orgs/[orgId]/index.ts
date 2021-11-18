import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import { getOrg } from "../../../../utils/orgs/getOrg";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../middleware/withSession";
import { updateUser } from "../../../../utils/users/updateUser";
import withAuth from "../../../../middleware/withAuth";
import { API_METHODS, ENTITY_TYPES, PLACEHOLDERS } from "../../../../defaults";
import { CUSTOM_QUERY } from "../../../../types/main";
import withValidMethod from "../../../../middleware/withValidMethod";
import clean from "../../../../utils/clean";
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query } = req; // TODO user type
  const { orgId } = query as Pick<CUSTOM_QUERY, "orgId">;

  const org = await getOrg({ orgId: orgId });

  if (method === API_METHODS.GET) {
    // When signed in, this returns all data for an org
    // For public org data such as basic info or openings, please use the
    // /api/public/orgs/[orgId] route

    if (orgId != req.session.user.orgId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this org" });
    }

    try {
      if (!org) {
        return res.status(404).json({ message: "Org not found" });
      }

      return res.status(200).json(org);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve org: ${error}` });
    }
  }

  if (method === API_METHODS.DELETE) {
    try {
      if (org.totalUsers > 1) {
        return res.status(400).json({
          message: "You cannot delete this org as there are other users in it",
        });
      }

      const updatedUser = await updateUser({
        userId: req.session.user.userId,
        newUserValues: {
          orgId: PLACEHOLDERS.NO_ORG,
          orgJoinDate: PLACEHOLDERS.NO_ORG,
          GSI1PK: PLACEHOLDERS.NO_ORG,
        },

        ALLOW_FORBIDDEN_KEYS: true,
      });
      req.session.user = clean(updatedUser, ENTITY_TYPES.USER);
      await req.session.save();
      return res
        .status(200)
        .json({ message: `You've deleted the ${orgId} org :(` });
    } catch (error) {
      // TODO add error logger
      return res
        .status(500) // TODO change #
        .json({
          message: `Unable to delete org - ${error}`,
        });
    }
  }
};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [
    API_METHODS.DELETE,
    API_METHODS.GET,
  ])
);
