import { NextApiResponse } from "next";
import withAuthorizer from "../../../../../middleware/withAuthorizer";
import { GetOrgInvites } from "../../../../../utils/invites/getAllOrgInvites";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, user } = req;

  if (method === "GET") {
    try {
      const invites = await GetOrgInvites(user.user_id);
      const not_claimed = invites.filter((invite) => {
        return !invite.is_claimed;
      });
      return res.status(200).json(not_claimed);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withAuthorizer(handler);
