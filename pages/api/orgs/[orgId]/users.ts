import { getAllUsersInOrg } from "../../../../utils/orgs/getAllUsersInOrg";
import withCleanOrgId from "../../../../middleware/withCleanOrgId";
import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../middleware/withSession";
import { API_METHODS } from "../../../../defaults";
import withAuth from "../../../../middleware/withAuth";
import withValidMethod from "../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../Types";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, query } = req;
  const { orgId } = query as Pick<CUSTOM_QUERY, "orgId">;

  if (method === API_METHODS.GET) {
    if (req.session.user.orgId != orgId) {
      // TODO team site bug returning 403 -- TODO I think this is fixed
      return res
        .status(403)
        .json({ message: "You cannot view the users of this org" });
    }

    if (req.session.user.orgId === "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: "You must create an org or join one to view it's users",
      });
    }

    try {
      const allUsers = await getAllUsersInOrg(req.session.user.orgId);
      return res.status(200).json(allUsers);
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to retrieve users - ${error}` });
    }
  }
};

export default withCleanOrgId(
  withValidMethod(withSessionRoute(withAuth(handler)), [API_METHODS.GET])
);
