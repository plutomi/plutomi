import {
  AllEntityNames,
  type Email,
  IndexableType,
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
      target: {
        id: email,
        type: IndexableType.User
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
    const now = new Date().toISOString();
    const userId = generatePlutomiId({
      date: new Date(),
      entity: AllEntityNames.User
    });
    const userData: User = {
      _id: userId,
      data: {
        firstName: null,
        lastName: null,
        emailVerified: false,
        canReceiveEmails: true,
        email: email as Email
      },
      createdAt: now,
      updatedAt: now,
      entityType: AllEntityNames.User,
      target: [
        {
          id: AllEntityNames.User,
          type: IndexableType.Entity
        },
        {
          id: userId,
          type: IndexableType.Id
        },
        {
          id: "NO_ORG",
          type: IndexableType.User
        },
        {
          id: "NO_WORKSPACE",
          type: IndexableType.User
        },
        {
          id: email as Email,
          type: IndexableType.User
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

    let;
  }

  // 2. If user exists, check if they have request a login code in the last 5 minutes

  // 3. If user exists and has requested a login code in the last 5 minutes, send a 403

  // 4. If user exists and has not requested a login code in the last 5 minutes, generate a login code and send it to the user's email

  // 5. If user does not exist, create a new user

  // 6. Generate a login code and send it to the user's email
};
