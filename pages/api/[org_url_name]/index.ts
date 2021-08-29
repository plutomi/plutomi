import { NextApiRequest, NextApiResponse } from "next";
import { CreateOrg } from "../../../utils/orgs/createOrg";
import withSessionId from "../../../middleware/withSessionId";
import { GetOrg } from "../../../utils/orgs/getOrg";
import withCleanOrgName from "../../../middleware/withCleanOrgName";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method, query } = req;
  const { org_official_name } = body;
  const org_url_name = query.org_url_name;

  // Create an org
  if (method === "POST") {
    const create_org_input: CreateOrgInput = {
      org_official_name: org_official_name,
      org_url_name: org_url_name as string,
    };

    for (const [key, value] of Object.entries(create_org_input)) {
      if (value == undefined) {
        return res
          .status(400)
          .json({ message: `Bad request: '${key}' is missing` });
      }
    }

    try {
      const org = await CreateOrg(create_org_input);
      return res.status(201).json(org);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  if (method === "GET") {
    try {
      const org = await GetOrg(org_url_name as string);
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

  return res.status(405).json({ message: "Not Allowed" });
};

export default withCleanOrgName(handler);
