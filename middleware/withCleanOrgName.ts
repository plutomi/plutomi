import { NextApiRequest, NextApiResponse } from "next";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

/**
 * Cleans up the org name just in case
 * @param handler
 */
export default function withCleanOrgName(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    req.query.org_id = tagGenerator.generate(req.query.org_id);
    return handler(req, res);
  };
}
