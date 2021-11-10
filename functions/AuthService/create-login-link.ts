import { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from "aws-lambda";
import FormattedResponse from "../../utils/formatResponse";
import { nanoid } from "nanoid";
import { createUser } from "../../utils/users/createUser";
import { getUserByEmail } from "../../utils/users/getUserByEmail";
import Joi from "@hapi/joi";
import { getLatestLoginLink } from "../../utils/loginLinks/getLatestLoginLink";
import sendLoginLink from "../../utils/email/sendLoginLink";
import { getPastOrFutureTime, getRelativeTime } from "../../utils/time";
import { createHash } from "crypto";
import createLoginLink from "../../utils/loginLinks/createLoginLink";
import withInputValidation from "../../middleware/withInputValidation";

const schema = Joi.object({
  userEmail: Joi.string().email().required(),
  loginMethod: Joi.string(),
  callbackUrl: Joi.string(),
});

const loginLinkLength = 1500;
const login_link_max_delay_minutes = 10;
const timeThreshold = getPastOrFutureTime(
  "past",
  login_link_max_delay_minutes,
  "minutes",
  "iso"
);
const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { userEmail, loginMethod, callbackUrl } = JSON.parse(event.body);

  let user = await getUserByEmail(userEmail);

  if (!user) {
    user = await createUser(userEmail);
  }

  try {
    const latest_link = await getLatestLoginLink(user.userId);

    // Limit the amount of links sent in a certain period of time
    if (
      latest_link &&
      latest_link.created_at >= timeThreshold &&
      !user.userEmail.endsWith("@plutomi.com")
    ) {
      return FormattedResponse(400, {
        message: `You're doing that too much, please try again later`,
      });
    }

    const secret = nanoid(loginLinkLength);
    const hash = createHash("sha512").update(secret).digest("hex");

    const loginLinkExpiry = getPastOrFutureTime("future", 15, "minutes", "iso");

    try {
      await createLoginLink({
        user: user,
        loginLinkHash: hash,
        loginLinkExpiry: loginLinkExpiry,
      });
      const default_redirect = `${process.env.WEBSITE_URL}/dashboard`;
      const loginLink = `${process.env.WEBSITE_URL}/api/auth/login?userId=${
        user.userId
      }&key=${secret}&callbackUrl=${
        callbackUrl ? callbackUrl : default_redirect
      }`;

      if (loginMethod === "GOOGLE") {
        return FormattedResponse(200, { message: loginLink });
      }
      try {
        await sendLoginLink({
          recipientEmail: user.userEmail,
          loginLink: loginLink,
          login_link_relative_expiry: getRelativeTime(loginLinkExpiry),
        });
        return FormattedResponse(200, {
          message: `We've sent a magic login link to your email!`,
        });

        // TODO error loggin
      } catch (error) {
        return FormattedResponse(500, { message: `${error}` });
      }
    } catch (error) {
      return FormattedResponse(500, { message: `${error}` });
    }
  } catch (error) {
    return FormattedResponse(500, {
      message: `An error ocurred getting your info, please try again`,
    });
  }
};
exports.handler = withInputValidation(main, schema);
