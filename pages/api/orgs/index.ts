import { NextApiRequest, NextApiResponse } from "next";
import { CreateOrg } from "../../../utils/orgs/createOrg";
import { GetOrg } from "../../../utils/orgs/getOrg";
import withCleanOrgName from "../../../middleware/withCleanOrgName";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { org_official_name, org_url_name } = body;

  // Create an org
  if (method === "POST") {
    const create_org_input: CreateOrgInput = {
      org_official_name: org_official_name,
      org_url_name: org_url_name,
    };

    let missing_keys = [];
    for (const [key, value] of Object.entries(create_org_input)) {
      if (value == undefined) {
        missing_keys.push(`'${key}'`);
      }
    }
    if (missing_keys.length > 0)
      return res.status(400).json({
        message: `Bad request: ${missing_keys.join(", ")} missing`,
      });

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

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;
