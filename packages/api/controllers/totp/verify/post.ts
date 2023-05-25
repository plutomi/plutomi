import {
  RelatedToType,
  type TOTPCode,
  TOTPCodeStatus,
  type User
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import dayjs from "dayjs";
import type { RequestHandler } from "express";
import Cookies from "cookies";
import { createSession } from "../../../utils/sessions";
import {
  env,
  getCookieKeys,
  getCookieSettings,
  getSessionCookieName
} from "../../../utils";

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

  let mostRecentCodes: TOTPCode[];

  try {
    mostRecentCodes = await req.items
      .find<TOTPCode>({
        relatedTo: {
          id: email,
          type: RelatedToType.TOTP
        }
      })
      .sort({ createdAt: -1 })
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

  const now = dayjs();

  const mostRecentCode = mostRecentCodes[0];
  if (
    // Code not found
    mostRecentCode === undefined ||
    // Expired by status
    mostRecentCode.status === TOTPCodeStatus.EXPIRED ||
    // Expired by exhaustive check
    dayjs(mostRecentCode.expiresAt).isBefore(now) ||
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
        id: email,
        type: RelatedToType.USER
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

  try {
    // Response is handled in here
    const sessionId = await createSession({ req, userId });

    // Set the session cookie
    const cookieJar = new Cookies(req, res, {
      keys: getCookieKeys(),
      secure: env.NODE_ENV === "production"
    });

    const cname = getSessionCookieName();
    const csetting = getCookieSettings();

    console.log(`Cookie name`, cname);
    console.log(`Cookie setting`, csetting);
    console.log(`sessionid`, sessionId);

    const x = cookieJar.set(cname, sessionId, csetting);

    const newc = x.get(cname);

    console.log(`XXXX`, newc);
    res.status(200).json({ message: "Logged in successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error ocurred creating your session", error });
    return;
  }

  const nowIso = now.toISOString();
  if (!user.emailVerified) {
    try {
      await req.items.updateOne(
        {
          relatedTo: {
            id: email,
            type: RelatedToType.USER
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

  // Expire all other codes
  try {
    await req.items.updateMany(
      {
        status: { $ne: TOTPCodeStatus.EXPIRED },
        relatedTo: {
          id: email,
          type: RelatedToType.TOTP
        }
      },
      {
        $set: {
          status: TOTPCodeStatus.EXPIRED,
          updatedAt: nowIso
        }
      }
    );
  } catch (error) {
    // TODO: Logging
  }
};
