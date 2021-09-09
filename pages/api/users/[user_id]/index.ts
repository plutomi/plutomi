import { NextApiRequest, NextApiResponse } from "next";
import { GetUserById } from "../../../../utils/users/getUserById";
import { SanitizeResponse } from "../../../../utils/sanitizeResponse";
import { Update } from "@aws-sdk/client-dynamodb";
import { UpdateUser } from "../../../../utils/users/updateUser";
import withAuthorizer from "../../../../middleware/withAuthorizer";
const handler = async (req: CustomRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { user_id } = query;

  if (method === "GET") {
    try {
      const user = await GetUserById(user_id as string);
      // Leaving req. in to identify the incoming user vs the others
      // TODO ^ until a proper variable is decided such as 'requestor'
      if (user.org_id != req.user.org_id) {
        return res
          .status(401)
          .json({ message: "You are not authorized to view this user" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      SanitizeResponse(user);
      return res.status(200).json(user);
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
