import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/**
 * Checks if there is a session in the request and in the future...
 * Checks API keys as well // TODO !!!!
 * @param handler Your function handler
 * @param methodsWithAuth An array of {@link API_METHODS} that require authorization checks, defaults to 'ALL'
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
      return res.status(401).json({ message: "Please log in again" }); // TODO error messages
    }

    return handler(req, res);
  };
}
