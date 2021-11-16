import { withSessionRoute } from "../../../middleware/withSession";
import { NextApiRequest, NextApiResponse } from "next";
import { API_METHODS } from "../../../defaults";
import withAuth from "../../../middleware/withAuth";
import withValidMethod from "../../../middleware/withValidMethod";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  req.session.destroy();
  return res.status(200).json({ message: "You've been logged out" });
};
export default withValidMethod(withSessionRoute(withAuth(handler)), [
  API_METHODS.POST,
]);
