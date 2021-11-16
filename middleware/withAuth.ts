import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/**
 * Checks if there is a session and in the future // TODO !!!!
 * Checks API keys as well
 * @param handler Your function handler
 * @param methodsWithAuth An array of {@link API_METHODS} that require authorization checks, defaults to 'ALL'
 * Since all methods are in one file in NextJS, we might need auth for *just* POST and not GET
 * @returns handler
 */
export default function withAuth(
  handler: NextApiHandler,
  methodsWithAuth: string[] | "ALL" = "ALL"
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // TODO when API keys are implemented, change this check
    // If the request method requires auth or if ALL methods require auth
    if (
      (methodsWithAuth.includes(req.method) || methodsWithAuth === "ALL") &&
      !req.session.user
    ) {
      req.session.destroy();
      return res.status(401).json({ message: "Please log in again" });
    }

    return handler(req, res);
  };
}
