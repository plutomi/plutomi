// pages/api/login.ts
import { NextApiResponse } from "next";
import { withIronSession } from "next-iron-session";
import { GetUserByEmail } from "../../utils/users/getUserByEmail";
import CleanUser from "../../utils/clean/cleanUser";
import ironConfig from "../../middleware/iron-session-config";
import withSession from "../../middleware/withSession";

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const user = req.session.get("user");

  return res.status(200).json({ user: user });
}

export default withSession(handler);
