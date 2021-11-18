import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/**
 * Checks if the user api call method valid
 * @param handler Your function handler
 * @param allowedMethods An array of accepted {@link API_METHODS}
 * @returns
 */
export default function withValidMethod(
  handler: NextApiHandler,
  allowedMethods: string[]
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({ message: "Method not allowed" });
    }

    return handler(req, res);
  };
}
