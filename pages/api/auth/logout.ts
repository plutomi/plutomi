import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { withIronSession, Session } from "next-iron-session";
type NextIronRequest = NextApiRequest & { session: Session };
import { session_options } from "../../../Config";
const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method === "POST") {
    try {
      req.session.destroy();
      res.setHeader("Set-Cookie", [
        serialize("is_logged_in", "", {
          maxAge: -1,
          path: "/",
        }),
      ]);
      return res.status(200).json({ message: "You've been logged out" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "An error ocurred logging you out" });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withIronSession(handler, session_options);
