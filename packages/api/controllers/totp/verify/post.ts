import {
  RelatedToType,
  TOTPCodeStatus,
  IdPrefix,
  type User,
  type Session,
  type TOTPCode,
  type Membership,
  SessionStatus,
  EmptyValues
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import dayjs from "dayjs";
import type { RequestHandler } from "express";
import {
  generatePlutomiId,
  getCookieJar,
  getCookieSettings,
  getSessionCookieName
} from "../../../utils";
import { MAX_SESSION_AGE_IN_MS } from "../../../consts";

export const post: RequestHandler = async (req, res) => {
  const { data, errorHandled } = validate({
    req,
    res,
    schema: Schema.LogInOrSignUp.validateEmailAndTotp.APISchema
  });

  if (errorHandled) {
    return;
  }

  const { email, totpCode } = data;

  let mostRecentCodes: TOTPCode[] = [];

  try {
    mostRecentCodes = await req.items
      .find<TOTPCode>({
        relatedTo: {
          $elemMatch: {
            id: email,
            type: RelatedToType.TOTPS
          }
        }
      })
      .sort({ _id: -1 })
      .limit(1)
      .toArray();
  } catch (error) {
    // TODO: Logging
    res.status(500).json({
      message: "An error ocurred getting your most recent login code",
      error
    });
    return;
  }

  const now = new Date();
  const nowIso = now.toISOString();

  const mostRecentCode = mostRecentCodes[0];
  if (
    // Code not found
    mostRecentCode === undefined ||
    // No longer active
    mostRecentCode.status !== TOTPCodeStatus.ACTIVE ||
    // Expired by date exhaustive check
    // TODO: Can remove when scheduled events are in
    dayjs(mostRecentCode.expires_at).isBefore(now) ||
    // Code is invalid
    mostRecentCode.code !== totpCode
  ) {
    // ! TODO: Increment attempts here, block email if too many attempts
    res.status(403).json({ message: "Invalid login code" });
    return;
  }

  // Get the user to set the cookie
  let user: User | null = null;

  try {
    user = await req.items.findOne<User>({
      relatedTo: {
        $elemMatch: {
          id: email,
          type: RelatedToType.USERS
        }
      }
    });
  } catch (error) {
    // TODO: Logging
    res
      .status(500)
      .json({ message: "An error ocurred logging you in!", error });
    return;
  }

  // This shouldn't happen, but just in case
  if (user === null) {
    res.status(500).json({ message: "An error ocurred logging you in!" });
    return;
  }

  const { _id: userId } = user;

  // Get the default membership for a user, and with it, the org and workspace
  let defaultUserMembership: Membership | null = null;

  try {
    defaultUserMembership = await req.items.findOne<Membership>({
      relatedTo: {
        $elemMatch: {
          id: userId,
          type: RelatedToType.MEMBERSHIPS
        }
      },
      isDefault: true
    });
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred getting your memberships!",
      error
    });
    return;
  }

  const sessionId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.SESSION
  });
  const orgForSession = defaultUserMembership?.org ?? EmptyValues.NO_ORG;
  const workspaceForSession =
    defaultUserMembership?.workspace ?? EmptyValues.NO_WORKSPACE;

  const newSession: Session = {
    _id: sessionId,
    _type: IdPrefix.SESSION,
    user: userId,
    org: orgForSession,
    workspace: workspaceForSession,
    created_at: now,
    updated_at: now,
    // ! TODO: Schedule an event to mark this as expired
    expires_at: dayjs(now)
      .add(MAX_SESSION_AGE_IN_MS, "milliseconds")
      .toISOString(),
    status: SessionStatus.ACTIVE,
    ip: req.clientIp ?? "unknown",
    user_agent: req.get("User-Agent") ?? "unknown",
    related_to: [
      {
        id: sessionId,
        type: RelatedToType.SELF
      },
      {
        id: userId,
        type: RelatedToType.SESSIONS
      },
      {
        id: workspaceForSession,
        type: RelatedToType.SESSIONS
      }
    ]
  };

  try {
    await req.items.insertOne(newSession);
  } catch (error) {
    res.status(500).json({ message: "An error ocurred logging you in!" });
    return;
  }

  try {
    const cookieJar = getCookieJar({ req, res });
    cookieJar.set(getSessionCookieName(), sessionId, getCookieSettings());

    res.status(200).json({ message: "Logged in successfully!" });
  } catch (error) {
    res.status(500).json({ message: "An error ocurred logging you in", error });
    return;
  }

  if (!user.email_verified) {
    try {
      await req.items.updateOne(
        {
          relatedTo: {
            $elemMatch: {
              id: email,
              type: RelatedToType.USERS
            }
          }
        },
        {
          $set: {
            emailVerified: true,
            emailVerifiedAt: nowIso,
            updatedAt: nowIso
          }
        }
      );
    } catch (error) {
      // TODO: Logging
    }
  }

  const { _id: usedCodeId } = mostRecentCode;

  try {
    // Mark the code that was just used as used
    // ! TODO: Find one and update!
    await req.items.updateOne<User>(
      {
        _id: usedCodeId
      },
      {
        $set: {
          status: TOTPCodeStatus.USED,
          updatedAt: nowIso,
          usedAt: nowIso
        }
      }
    );
  } catch (error) {
    // ! TODO: Logging
  }

  // Expire all other active codes
  try {
    await req.items.updateMany(
      {
        _id: { $ne: usedCodeId },
        status: TOTPCodeStatus.ACTIVE,
        relatedTo: {
          $elemMatch: {
            id: email,
            type: RelatedToType.TOTPS
          }
        }
      },
      {
        $set: {
          status: TOTPCodeStatus.INVALIDATED,
          updatedAt: nowIso,
          invalidatedAt: nowIso
        }
      }
    );
  } catch (error) {
    // ! TODO: Logging
  }
};
