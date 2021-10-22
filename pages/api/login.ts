// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession, Session } from "next-iron-session";
import { GetUserByEmail } from "../../utils/users/getUserByEmail";
import CleanUser from "../../utils/clean/cleanUser";
import withSession from "../../middleware/withSession";
import CleanOpening from "../../utils/clean/cleanOpening";
type NextIronRequest = NextApiRequest & { session: Session };

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  const { user_email } = req.body;
  if (!user_email) {
    return res.status(400).json({ message: "Missing `user_email`" });
  }

  try {
    const user = await GetUserByEmail(user_email as string);

  } catch (error) {
    return res.status(400).json({ message: "Unable to return user" });
  }
}

export default withSession(handler);
