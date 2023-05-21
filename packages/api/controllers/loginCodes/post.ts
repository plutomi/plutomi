import {
  AllEntityNames,
  type Email,
  RelatedToType,
  type User
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler } from "express";
import { generatePlutomiId } from "../../utils";

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

  // Check if a user exists with that email, and if not, create them
  let user: User | null = null;

  try {
    user = await req.items.findOne<User>({
      relatedTo: {
        id: email,
        type: RelatedToType.USER
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error ocurred checking if a user exists with that email.",
      error
    });
    return;
  }

  if (user === null) {
    const now = new Date();
    const nowIso = now.toISOString();
    const userId = generatePlutomiId({
      date: now,
      entity: AllEntityNames.USER
    });
    const userData: User = {
      _id: userId,
      firstName: null,
      lastName: null,
      emailVerified: false,
      canReceiveEmails: true,
      email: email as Email,
      createdAt: nowIso,
      updatedAt: nowIso,
      entityType: AllEntityNames.USER,
      relatedTo: [
        {
          id: AllEntityNames.USER,
          type: RelatedToType.ENTITY
        },
        {
          id: userId,
          type: RelatedToType.ID
        },
        {
          id: email as Email,
          type: RelatedToType.USER
        }
      ]
    };

    try {
      // ! TODO: Concurrency issue when two people make the request at the same time
      await req.items.insertOne(userData);
      user = userData;
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "An error ocurred creating your user account",
        error
      });
      return;
    }
  }

  try {

    const recentLoginCodes = await req.items.find<LoginCode>({
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "An error ocurred checking for recent login codes",
        error
      });
  }

  // 2. If user exists, check if they have request a login code in the last 5 minutes

  // 3. If user exists and has requested a login code in the last 5 minutes, send a 403

  // 4. If user exists and has not requested a login code in the last 5 minutes, generate a login code and send it to the user's email

  // 5. If user does not exist, create a new user

  // 6. Generate a login code and send it to the user's email
};
