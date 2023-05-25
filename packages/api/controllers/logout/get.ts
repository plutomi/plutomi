import type { RequestHandler } from "express";
import dayjs from "dayjs";
import {
  type AllEntityNames,
  type PlutomiId,
  SessionStatus
} from "@plutomi/shared";
import {
  getCookieJar,
  getCookieSettings,
  getSessionCookieName
} from "../../utils";

// TODO Handle query param to log out of all sessions
export const get: RequestHandler = async (req, res) => {
  const cookieJar = getCookieJar({ req, res });
  const cookieName = getSessionCookieName();
  const sessionId = cookieJar.get(cookieName, { signed: true });

  // Delete cookie client side
  cookieJar.set(cookieName, undefined, getCookieSettings());

  res.status(200).json({ message: "You've been logged out!" });

  if (sessionId !== undefined) {
    // Log out the session in DB
    try {
      await req.items.updateOne(
        {
          _id: sessionId as PlutomiId<AllEntityNames.SESSION>
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
  }
};
