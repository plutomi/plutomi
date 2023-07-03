import type { RequestHandler } from "express";
import { type Session, SessionStatus, type AllEntities } from "@plutomi/shared";
import type { Filter, StrictFilter, StrictUpdateFilter } from "mongodb";
import { clearCookie, getCookieJar } from "../../utils";

// TODO Handle query param to log out of all sessions
export const get: RequestHandler = async (req, res) => {
  const cookieJar = getCookieJar({ req, res });

  // Delete cookie client side
  clearCookie({ cookieJar });

  res.sendStatus(204);
  const { _id: sessionId } = req.session;
  const now = new Date();

  try {
    const findSessionByIdFilter: StrictFilter<Session> = {
      _id: sessionId,
      // Only mark as logged out if the session is active
      status: SessionStatus.ACTIVE
    };

    const logOutSessionUpdateFilter: StrictUpdateFilter<Session> = {
      $set: {
        logged_out_at: now,
        updated_at: now,
        status: SessionStatus.LOGGED_OUT
      }
    };

    // Log out the session in the DB
    await req.items.findOneAndUpdate(
      findSessionByIdFilter as Filter<AllEntities>,
      logOutSessionUpdateFilter
    );
  } catch (error) {
    // ! TODO: Logging
  }
};
