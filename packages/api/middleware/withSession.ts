import type { RequestHandler } from "express";
import type { IdPrefix, PlutomiId, Session, User } from "@plutomi/shared";
import {
  clearCookie,
  getCookieJar,
  getSessionCookieName,
  sessionIsActive
} from "../utils";

export const withSession: RequestHandler = async (req, res, next) => {
  const cookieJar = getCookieJar({ req, res });
  const sessionId = cookieJar.get(getSessionCookieName(), { signed: true });

  if (sessionId === undefined) {
    clearCookie({ cookieJar });
    res.status(401).json({
      message: "Please log in again."
    });
    return;
  }

  try {
    const session = await req.items.findOne<Session>({
      _id: sessionId as PlutomiId<IdPrefix.SESSION>
    });

    if (session === null || !sessionIsActive({ session })) {
      clearCookie({ cookieJar });
      res.status(401).json({
        message: "Please log in again."
      });
      return;
    }

    // ! TODO: Extend session by 4 hours
    req.session = session;
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred authenticating your session",
      error
    });
    return;
  }

  // Get the user attached to the session
  try {
    const user = await req.items.findOne<User>({
      _id: req.session.user
    });

    if (user === null) {
      res.status(401).json({
        message: "Please log in again."
      });
      return;
    }

    req.user = user;
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred authenticating your session",
      error
    });
  }
  next();
};
