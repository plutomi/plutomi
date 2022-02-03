import { nanoid } from "nanoid";

/**
 * Generates a clean orgId, used for tests
 *  TODO might not be needed when https://github.com/plutomi/plutomi/issues/530
 * is added as we can return the processed ID from the middleware
 */

const OrgID = (length: number) => {
  const UrlSafeString = require("url-safe-string"),
    tagGenerator = new UrlSafeString();

  return tagGenerator.generate(nanoid(length));
};
const QuestionID = (length: number) => {
  const UrlSafeString = require("url-safe-string"),
    tagGenerator = new UrlSafeString({ joinString: "_" });
  return tagGenerator.generate(nanoid(length));
};

export { OrgID, QuestionID };
