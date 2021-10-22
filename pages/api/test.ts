// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession, Session } from "next-iron-session";
import { GetUserByEmail } from "../../utils/users/getUserByEmail";
import CleanUser from "../../utils/clean/cleanUser";
import ironConfig from "../../middleware/iron-session-config";
type NextIronRequest = NextApiRequest & { session: Session };

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const user = req.session.get("user");

  return res.status(200).json({ user: user });
}

export default withIronSession(handler, ironConfig);
