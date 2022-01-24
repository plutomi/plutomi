import { Request, Response } from "express";
import { DEFAULTS } from "../../Config";
import * as Orgs from "../../models/Orgs";
import * as CreateError from "../../utils/createError";
import { pick } from "lodash";
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;

  const [users, error] = await Orgs.GetUsersInOrg({
    orgId: session.orgId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      "An error ocurred getting the users in your org"
    );

    return res.status(status).json(body);
  }

  const cleanUsers = users.map((user) =>
    pick(user, [
      "userId",
      "orgId",
      "firstName",
      "lastName",
      "email",
      "orgJoinDate",
    ])
  );

  return res.status(200).json(cleanUsers);
};
export default main;
