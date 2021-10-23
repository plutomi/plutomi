import withSession from "../../../middleware/withSession";
import { NextApiResponse } from "next";
export default withSession(
  async (req: NextIronRequest, res: NextApiResponse): Promise<void> => {
    const { method } = req;
    if (method === "POST") {
      req.session.destroy();
      return res.status(200).json({ message: "You've been logged out" });
    }

    return res.status(405).json({ message: "Not Allowed" });
  }
);
