import { NextApiRequest, NextApiResponse } from "next";
import { CreateOrg } from "../../../utils/orgs/createOrg";
import withSessionId from "../../../middleware/withSessionId";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { org_name, user_info } = body;

  if (method === "POST") {
    try {
      const org = await CreateOrg(org_name, user_info);
      return res.status(201).json(org);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSessionId(handler);
