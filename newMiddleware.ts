// Temporary
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

export const methodNotAllowed = (req, res, next) => res.status(405).send();
export const routeNotFound = (req, res, next) => res.status(404).send();

export const cleanOrgId = (req, res, next) => {
  /**
   * Makes the orgId, whether in the url params or in the body, have a specific, URL Safe, format
   */
  if (req.body.orgId) {
    req.body.orgId = tagGenerator.generate(req.body.orgId);
  }

  if (req.params.orgId) {
    req.params.orgId = tagGenerator.generate(req.params.orgId);
  }
  next();
};
