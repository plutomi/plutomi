import { NextApiResponse } from "next";
import { CreateOrg } from "../../../utils/orgs/createOrg";
import withCleanOrgName from "../../../middleware/withCleanOrgName";
import InputValidation from "../../../utils/inputValidation";
import { GetAllUserInvites } from "../../../utils/invites/getAllOrgInvites";
import withSession from "../../../middleware/withSession";
import CleanUser from "../../../utils/clean/cleanUser";
import { UpdateUser } from "../../../utils/users/updateUser";
import { GetCurrentTime } from "../../../utils/time";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user_session = req.session.get("user");
  if (!user_session) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
  const { body, method } = req;
  const { GSI1SK, org_id }: APICreateOrgInput = body;

  // Create an org
  if (method === "POST") {
    if (GSI1SK === "NO_ORG_ASSIGNED") {
      // TODO major, this isn't using the withcleanorgname
      return res.status(400).json({
        message: `You cannot create an org with this name: ${GSI1SK}`,
      });
    }
    if (user_session.org_id != "NO_ORG_ASSIGNED") {
      return res.status(400).json({
        message: `You already belong to an org!`,
      });
    }

    const pending_invites = await GetAllUserInvites(user_session.user_id);

    if (pending_invites && pending_invites.length > 0) {
      return res.status(403).json({
        message:
          "You seem to have pending invites, please accept or reject them before creating an org :)",
      });
    }

    const create_org_input: CreateOrgInput = {
      GSI1SK: GSI1SK,
      org_id: org_id,
      user: user_session,
    };

    try {
      InputValidation(create_org_input);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    // TODO add joi
    if (GSI1SK.length == 0) {
      return res.status(400).json({ message: "Org name cannot be empty" });
    }
    try {
      // TODO promise all create and join
      const org = await CreateOrg(create_org_input);

      try {
        const updated_user = await UpdateUser({
          user_id: user_session.user_id,
          new_user_values: {
            org_id: org_id,
            org_join_date: GetCurrentTime("iso"),
            GSI1PK: `ORG#${org_id}#USERS`,
          },
          ALLOW_FORBIDDEN_KEYS: true,
        });

        // Update the logged in user session with the new org id
        req.session.set("user", CleanUser(updated_user));
        await req.session.save();

        return res.status(201).json({ message: "Org created!", org: org });
      } catch (error) {
        // TODO retry this
        return res.status(500).json({
          message:
            "We were able to create your org, however you were not able to join it",
        });
      }
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withSession(withCleanOrgName(handler));
