import { NextApiResponse } from "next";
import withAuthorizer from "../../../../../middleware/withAuthorizer";
import { GetOrgInvites } from "../../../../../utils/users/getOrgInvites";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, user } = req;

  if (method === "GET") {
    try {
      const invites = await GetOrgInvites(user.user_id);

      console.log("Invites", invites);
      return res.status(200).json(invites);
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
