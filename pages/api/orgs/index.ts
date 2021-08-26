import { NextApiRequest, NextApiResponse } from "next";
import { CreateOrg } from "../../../utils/orgs/createOrg";
import { Clean } from "../../../utils/clean";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { org_name } = body;

  if (method === "POST") {
    try {
      const org = await CreateOrg(org_name);
      return res.status(201).json(org);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create org: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
