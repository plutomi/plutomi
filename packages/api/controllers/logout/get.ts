import type { RequestHandler } from "express";
import dayjs from "dayjs";
import { SessionStatus } from "@plutomi/shared";
import { clearCookie, getCookieJar } from "../../utils";

// TODO Handle query param to log out of all sessions
export const get: RequestHandler = async (req, res) => {
  const cookieJar = getCookieJar({ req, res });

  // Delete cookie client side
  clearCookie({ cookieJar });

  res.sendStatus(204);

  const { _id: sessionId } = req.session;

  try {
    // Log out the session in the DB
    await req.items.updateOne(
      {
        _id: sessionId
      },
      {
        $set: {
          status: SessionStatus.LOGGED_OUT,
          updatedAt: dayjs().toISOString()
        }
      }
    );
  } catch (error) {
    // ! TODO: Logging
  }
};
