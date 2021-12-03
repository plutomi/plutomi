import { EMAILS, ENTITY_TYPES, LOGIN_METHODS, TIME_UNITS } from "../Config";
import { getOrg } from "../utils/orgs/getOrg";
import { Request, Response } from "express";
import Sanitize from "../utils/sanitize";
import { getAllOpeningsInOrg } from "../utils/openings/getAllOpeningsInOrg";
import { getOpening } from "../utils/openings/getOpeningById";
import { sealData } from "iron-session";
import Joi from "joi";
import { nanoid } from "nanoid";
import { getLatestLoginLink } from "../utils/loginLinks/getLatestLoginLink";
import sendEmail from "../utils/sendEmail";
import Time from "../utils/time";
import { createUser } from "../utils/users/createUser";
import { getUserByEmail } from "../utils/users/getUserByEmail";
import createLoginLink from "../utils/loginLinks/createLoginLink";
import { CUSTOM_QUERY } from "../types/main";

const ironPassword = process.env.IRON_SEAL_PASSWORD;

export const ironOptions = {
  password: ironPassword,
  ttl: 60 * 15, // Seal will be valid for 15 minutes // TODO test seal
};

// export const createLoginLink = async (req: Request, res: Response) => {}; // TODO change this name

export const login = async (req: Request, res: Response) => {
  const { email, loginMethod } = req.body;
  const { seal, callbackUrl } = req.query as Pick<
    CUSTOM_QUERY,
    "callbackUrl" | "userId" | "seal"
  >;
  // Creates a login link
  const createLoginLinkInput = {
    // TODO create type
    email: email,
    loginMethod: loginMethod,
  };

  const schema = Joi.object({
    email: Joi.string().email(),
    loginMethod: Joi.string().valid(LOGIN_METHODS.GOOGLE, LOGIN_METHODS.LINK),
  }).options({ presence: "required" });

  // Validate input
  try {
    await schema.validateAsync(createLoginLinkInput);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  let user = await getUserByEmail({ email });

  if (!user) {
    user = await createUser({ email });
  }

  try {
    const latestLink = await getLatestLoginLink({
      userId: user.userId,
    });

    // Limit the amount of links sent in a certain period of time
    const timeThreshold = Time.pastISO(10, TIME_UNITS.MINUTES);

    if (
      latestLink &&
      latestLink.createdAt >= timeThreshold &&
      !user.email.endsWith("@plutomi.com") // todo contact enum or domain name
    ) {
      return res.status(400).json({
        message: "You're doing that too much, please try again later", // TODO enum
      });
    }

    const loginLinkId = nanoid(100);
    const loginLinkExpiry = Time.futureISO(15, TIME_UNITS.MINUTES); // when the link expires

    const seal = await sealData(
      {
        userId: user.userId,
        loginLinkId: loginLinkId,
      },
      ironOptions
    );

    try {
      await createLoginLink({
        userId: user.userId,
        loginLinkId,
      });

      const defaultRedirect = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard`;
      const loginLink = `${
        process.env.NEXT_PUBLIC_WEBSITE_URL
      }/api/auth/login?seal=${seal}&callbackUrl=${
        callbackUrl ? callbackUrl : defaultRedirect
      }`;

      if (loginMethod === LOGIN_METHODS.GOOGLE) {
        // Cannot do serverside redirect from axios post
        return res.status(200).json({ message: loginLink });
      }

      try {
        await sendEmail({
          fromName: "Plutomi",
          fromAddress: EMAILS.GENERAL,
          toAddresses: [user.email],
          subject: `Your magic login link is here!`,
          html: `<h1><a href="${loginLink}" noreferrer target="_blank" >Click this link to log in</a></h1><p>It will expire ${Time.relative(
            new Date(loginLinkExpiry)
          )}. <strong>DO NOT SHARE THIS LINK WITH ANYONE!!!</strong></p><p>If you did not request this link, you can safely ignore it.</p>`,
        });
        return res
          .status(201) // todo switch to 200?
          .json({ message: `We've sent a magic login link to your email!` });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `${error}` }); // TODO error #
      }
    } catch (error) {
      console.error(error);
      // TODO error #
      return res.status(500).json({ message: `${error}` });
    }
  } catch (error) {
    console.error("Error getting login link", error);
    return res.status(500).json({
      // TODO error #
      message: "An error ocurred getting your info, please try again",
    });
  }
};

export const logout = async (req: Request, res: Response) => {};
