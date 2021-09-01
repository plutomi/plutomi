import { NextApiRequest, NextApiResponse } from "next";
import { GetUserById } from "../../../../utils/users/getUserById";
import { SanitizeResponse } from "../../../../utils/sanitizeResponse";
import withUserId from "../../../../middleware/withUserId";
import { JoinOrg } from "../../../../utils/users/joinOrg";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body } = req;
  const { user_id } = body;
  const { org_url_name } = query;

  const join_org_input: JoinOrgInput = {
    user_id: user_id,
    org_url_name: org_url_name as string,
  };
  if (method === "POST") {
    try {
      await JoinOrg(join_org_input);
      return res
        .status(200)
        .json({ message: `You've joined the ${org_url_name} org!` });
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
