import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import { getOrg } from "../../../../utils/orgs/getOrg";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../middleware/withSession";
import cleanUser from "../../../../utils/clean/cleanUser";
import { updateUser } from "../../../../utils/users/updateUser";
import withAuth from "../../../../middleware/withAuth";
import { API_METHODS } from "../../../../defaults";
import { CUSTOM_QUERY } from "../../../../Types";
import withValidMethod from "../../../../middleware/withValidMethod";
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query } = req; // TODO user type
  const { orgId } = query as Pick<CUSTOM_QUERY, "orgId">;

  const userSession = req.session.user;
  const org = await getOrg(orgId);

  if (method === API_METHODS.GET) {
    // When signed in, this returns all data for an org
    // For public org data such as basic info or openings, please use the
    // /api/public/orgs/[orgId] route

    if (orgId != userSession.orgId) {
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
        userId: userSession.userId,
        newUserValues: {
          orgId: "NO_ORG_ASSIGNED",
          orgJoinDate: "NO_ORG_ASSIGNED",
          GSI1PK: "NO_ORG_ASSIGNED",
        },

        ALLOW_FORBIDDEN_KEYS: true,
      });
      req.session.user = cleanUser(updatedUser);
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
