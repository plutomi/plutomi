import {
  IdPrefix,
  RelatedToType,
  generateTOTP,
  type User,
  type Email,
  type TOTPCode,
  TOTPCodeStatus,
  TOTP_EXPIRATION_TIME_IN_MINUTES,
  PlutomiEmails,
  MAX_TOTP_LOOK_BACK_TIME_IN_MINUTES,
  MAX_TOTP_COUNT_ALLOWED_IN_LOOK_BACK_TIME,
  type Session,
  type PlutomiId
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler } from "express";
import dayjs from "dayjs";
import {
  EMAIL_TEMPLATES,
  clearCookie,
  generatePlutomiId,
  getCookieJar,
  getSessionCookieName,
  sendEmail,
  sessionIsActive
} from "../../utils";

export const post: RequestHandler = async (req, res) => {
  const { data, errorHandled } = validate({
    req,
    res,
    schema: Schema.LogInOrSignUp.email.APISchema
  });

  if (errorHandled) {
    return;
  }

  const { email } = data;

  let user: User | null = null;

  try {
    // Check if a user exists with that email, and if not, create them
    user = await req.items.findOne<User>({
      relatedTo: {
        $elemMatch: {
          id: email,
          type: RelatedToType.USERS
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred checking if a user exists with that email",
      error
    });
    return;
  }

  if (user === null) {
    // Create the user first
    const now = new Date();
    const userId = generatePlutomiId({
      date: now,
      idPrefix: IdPrefix.USER
    });

    const userData: User = {
      _id: userId,
      firstName: null,
      lastName: null,
      emailVerified: false,
      emailVerifiedAt: null,
      canReceiveEmails: true,
      email: email as Email,
      createdAt: now,
      updatedAt: now,
      entityType: IdPrefix.USER,
      relatedTo: [
        {
          id: IdPrefix.USER,
          type: RelatedToType.ENTITY
        },
        {
          id: userId,
          type: RelatedToType.SELF
        },
        {
          id: email as Email,
          type: RelatedToType.USERS
        }
      ]
    };

    try {
      // ! TODO: Concurrency issue when two people make the request at the same time
      await req.items.insertOne(userData);
      user = userData;
    } catch (error) {
      res.status(500).json({
        message: "An error ocurred creating your user account",
        error
      });
      return;
    }
  }

  if (!user.canReceiveEmails) {
    res.status(403).json({
      message: `You have unsubscribed from emails from Plutomi. Please reach out to ${PlutomiEmails.JOSE} if you would like to resubscribe.`
    });
    return;
  }

  const cookieJar = getCookieJar({ req, res });
  const sessionId = cookieJar.get(getSessionCookieName(), { signed: true });

  if (sessionId !== undefined) {
    // If a user already has a session, and it is valid, redirect them to dashboard
    try {
      const session = await req.items.findOne<Session>({
        _id: sessionId as PlutomiId<IdPrefix.SESSION>
      });

      // ! TODO: Clean this up in two parts, first check if session is null, then check if it is active
      if (session !== null && sessionIsActive({ session })) {
        res.status(302).json({
          message: "You already have an active session!"
        });
        return;
      }

      // Delete the previous cookie, if any, they will get a new one on their new login
      // Any other session statuses are irrelevant from this point.
      clearCookie({ cookieJar });
    } catch (error) {
      res.status(500).json({
        message: "An error ocurred creating a session for you",
        error
      });
      return;
    }
  }

  let recentTotpCodes: TOTPCode[] = [];
  const { _id: userId } = user;

  try {
    // Get the recent login codes for this user, and see if they're allowed to request another one at this time
    recentTotpCodes = await req.items
      .find<TOTPCode>(
        {
          status: TOTPCodeStatus.ACTIVE,
          relatedTo: {
            $elemMatch: {
              id: userId,
              type: RelatedToType.TOTPS
            }
          },
          createdAt: {
            $gte: dayjs()
              .subtract(MAX_TOTP_LOOK_BACK_TIME_IN_MINUTES, "minutes")
              .toDate()
          }
        },
        {
          limit: MAX_TOTP_COUNT_ALLOWED_IN_LOOK_BACK_TIME
        }
      )
      .toArray();
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred checking for any recent login codes",
      error
    });
    return;
  }

  if (recentTotpCodes.length >= MAX_TOTP_COUNT_ALLOWED_IN_LOOK_BACK_TIME) {
    // ! TODO: Log attempt
    res.status(403).json({
      message:
        "You have requested too many login codes recently, please try again in a bit."
    });
    return;
  }

  const totpCode = generateTOTP();

  try {
    // Create a new code for the user
    const now = new Date();
    const totpCodeId = generatePlutomiId({
      date: now,
      idPrefix: IdPrefix.TOTP
    });

    const newTotpCode: TOTPCode = {
      _id: totpCodeId,
      code: totpCode,
      user: userId,
      email: email as Email,
      createdAt: now,
      updatedAt: now,
      entityType: IdPrefix.TOTP,
      expiresAt: dayjs(now)
        .add(TOTP_EXPIRATION_TIME_IN_MINUTES, "minutes")
        .toDate(),
      status: TOTPCodeStatus.ACTIVE,
      relatedTo: [
        {
          id: IdPrefix.TOTP,
          type: RelatedToType.ENTITY
        },
        {
          id: totpCodeId,
          type: RelatedToType.SELF
        },
        {
          id: userId,
          type: RelatedToType.TOTPS
        },
        {
          id: email as Email,
          type: RelatedToType.TOTPS
        }
      ]
    };

    await req.items.insertOne(newTotpCode);
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred creating your login code",
      error
    });
  }

  try {
    await sendEmail({
      to: email as Email,
      subject: `Your Plutomi Code - ${totpCode}`,
      from: {
        header: "Plutomi",
        email: PlutomiEmails.NO_REPLY
      },
      bodyHtml: EMAIL_TEMPLATES.TOTPTemplate({ code: totpCode })
    });

    res.status(201).json({
      message: "A login code has been sent to your email"
    });
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred sending your login code",
      error
    });
  }
};
