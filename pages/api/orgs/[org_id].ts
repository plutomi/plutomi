import { NextApiRequest, NextApiResponse } from "next";
import { Clean } from "../../../utils/clean";
import { GetOrg } from "../../../utils/orgs/getOrg";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { org_id } = query;

  if (method === "GET") {
    try {
      const org = await GetOrg(org_id as string);
      if (!org) {
        return res.status(404).json({ message: "Org not found" });
      }
      Clean(org);
      return res.status(200).json(org);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve org: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
