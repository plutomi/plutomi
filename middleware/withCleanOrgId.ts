import { NextApiRequest, NextApiResponse } from "next";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

// Cleans up the orgId to be URL safe if in body or query
export default function withCleanOrgId(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.body.orgId) {
      req.body.orgId = tagGenerator.generate(req.body.orgId);
    }

    if (req.query.orgId) {
      req.query.orgId = tagGenerator.generate(req.query.orgId);
    }

    return handler(req, res);
  };
}
