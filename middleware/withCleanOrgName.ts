import { NextApiRequest, NextApiResponse } from "next";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

/**
 * Cleans up the org name to be URL safe
 * @param handler
 */
export default function withCleanOrgName(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.body.org_id) {
      req.body.org_id = tagGenerator.generate(req.body.org_id);
    }

    if (req.query.org_id) {
      req.query.org_id = tagGenerator.generate(req.query.org_id);
    }
    return handler(req, res);
  };
}
