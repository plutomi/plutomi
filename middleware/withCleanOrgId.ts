import { NextApiRequest, NextApiResponse } from "next";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

// Cleans up the org name (or ID technically) to be URL safe
export default function withCleanOrgId(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.body.orgId) {
      req.body.orgId = tagGenerator.generate(req.body.orgId);
    }

    if (req.query.orgId) {
      req.query.orgId = tagGenerator.generate(req.query.orgId);
    }

    if (req.body.orgId) {
      req.body.orgId = tagGenerator.generate(req.body.orgId);
    }
    return handler(req, res);
  };
}
