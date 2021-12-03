import Time from "../../../utils/time";
import { NextApiRequest, NextApiResponse } from "next";
import createLoginLink from "../../../utils/loginLinks/createLoginLink";
import { nanoid } from "nanoid";
import { withSessionRoute } from "../../../middleware/withSession";
import { sealData, unsealData } from "iron-session";
import { getLatestLoginLink } from "../../../utils/loginLinks/getLatestLoginLink";
import { createUser } from "../../../utils/users/createUser";
import { getUserById } from "../../../utils/users/getUserById";
import Sanitize from "../../../utils/sanitize";
import {
  TIME_UNITS,
  API_METHODS,
  EMAILS,
  ENTITY_TYPES,
  DEFAULTS,
  LOGIN_METHODS,
} from "../../../Config";
import withValidMethod from "../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../types/main";
import sendEmail from "../../../utils/sendEmail";
import { getOrgInvitesForUser } from "../../../utils/invites/getOrgInvitesForUser";
import { createLoginEventAndDeleteLoginLink } from "../../../utils/loginLinks/createLoginEventAndDeleteLoginLink";
import Joi from "joi";


const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { body, method, query } = req; // TODO get from body
  const { email, loginMethod } = body;
  const { seal, callbackUrl } = query as Pick<
    CUSTOM_QUERY,
    "callbackUrl" | "userId" | "seal"
  >;

  // Validates the login link when clicked
  if (method === API_METHODS.GET) {
    const { userId, loginLinkId }: { userId: string; loginLinkId: string } =
      await unsealData(
        // TODO types, // TODO try catch
        seal,
        ironOptions
      );
    if (!userId || !loginLinkId) {
      // Time expired
      return res.status(401).json({ message: "Your link is invalid" });
    }

    const user = await getUserById({ userId });

    if (!user) {
      return res
        .status(401) // I dont know in what situation this would happen, but just in case.. we need the user's orgId anyway
        .json({ message: "Invalid userId, please login again" });
    }

    const userOrg = user.orgId !== DEFAULTS.NO_ORG ?? user.orgId;
    await createLoginEventAndDeleteLoginLink({
      loginLinkId,
      userId,
      orgId: userOrg,
    });

    const cleanedUser = Sanitize.clean(user, ENTITY_TYPES.USER);
    req.session.user = cleanedUser;

    /**
     * Get the user's org invites, if any, if they're not in an org.
     * The logic here being, if a user is in an org, what are the chances they're going to join another?
     *  TODO maybe revisit this?
     */
    let userInvites = []; // TODO types array of org invite
    if (req.session.user.orgId === DEFAULTS.NO_ORG) {
      userInvites = await getOrgInvitesForUser({
        userId: req.session.user.userId,
      });
    }
    req.session.user.totalInvites = userInvites.length;
    await req.session.save();

    // If a user has invites, redirect them to the invites page on login
    if (req.session.user.totalInvites > 0) {
      res.redirect(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/invites`);
      return;
    }

    res.redirect(307, callbackUrl);
    return;
  }
};

export default withValidMethod(withSessionRoute(handler), [
  // NO AUTH as this will block all requests without a session.. and uhh.. we're creating sessions here
  API_METHODS.POST,
  API_METHODS.GET,
]);
