import { Request, Response } from "express";
import * as Users from "../../models/Users";
import Joi from "joi";
import * as CreateError from "../../utils/errorGenerator";
import { DEFAULTS, JOI_GLOBAL_FORBIDDEN, JOI_SETTINGS } from "../../Config";

interface APIUpdateUserParameters {
  userId?: string;
}
interface APIUpdateUserBody {
  newValues?: { [key: string]: any };
}

/**
 * When calling PUT /users/:userId, these properties cannot be updated by the user
 */
export const JOI_FORBIDDEN_USER = {
  ...JOI_GLOBAL_FORBIDDEN,
  userId: Joi.any().forbidden().strip(),
  userRole: Joi.any().forbidden().strip(), // TODO rbac
  orgJoinDate: Joi.any().forbidden().strip(),
  canReceiveEmails: Joi.any().forbidden().strip(),
  GSI1PK: Joi.any().forbidden().strip(), // Org users
  firstName: Joi.string().invalid(DEFAULTS.FIRST_NAME).optional(),
  lastName: Joi.string().invalid(DEFAULTS.LAST_NAME).optional(),
  unsubscribeKey: Joi.any().forbidden().strip(),
  GSI2PK: Joi.any().forbidden().strip(), // Email
  GSI2SK: Joi.any().forbidden().strip(), // Entity type
  totalInvites: Joi.any().forbidden().strip(),
  verifiedEmail: Joi.any().forbidden().strip(), // Updated asynchronously (step functions) on 1st login
};

const schema = Joi.object({
  params: {
    userId: Joi.string(),
  },
  body: {
    newValues: JOI_FORBIDDEN_USER,
  },
}).options(JOI_SETTINGS);

const main = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { session } = res.locals;
  const { userId }: APIUpdateUserParameters = req.params;
  const { newValues }: APIUpdateUserBody = req.body;

  // TODO RBAC will go here, right now you can only update yourself
  if (userId !== session.userId) {
    return res.status(403).json({ message: "You cannot update this user" });
  }

  const [updatedUser, error] = await Users.UpdateUser({
    userId: session.userId,
    newValues,
  });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      "An error ocurred updating user info"
    );
    return res.status(status).json(body);
  }

  return res.status(200).json({
    // TODO RBAC is not implemented yet so this won't trigger
    message: userId === session.userId ? "Updated your info!" : "User updated!",
  });
};

export default main;
