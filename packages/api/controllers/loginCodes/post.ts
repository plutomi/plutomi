import { AllEntityNames, Email, IndexableType, User } from "@plutomi/shared";
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

  // 1. Check if user exists in database

  let user: User | null = null;

  try {
    const userInMongo = await req.items.findOne<User>({
      target: {
        id: email,
        type: IndexableType.Email
      }
    });

    
    if (userInMongo === null) {
      // ! TODO: Create user

      const now = new Date().toISOString();
      const userId = generatePlutomiId({date: new Date(), entity: AllEntityNames.User});
      const newUser: User = {
        _id: userId,
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
                type: IndexableType.Id,
            },
            {
                id: null,
                type: IndexableType.User,
            },
            {
                id: null,
                type: IndexableType.User,
            },
            {
                id: email as Email,
                type: IndexableType.Email,
            }
        ]
      }

      const createdUser = await req.items.insertOne(newUser);

      createdUser.
    res.send(response);
  } catch (error) {
    console.error(error);
    res.send(error);
  }

  // 2. If user exists, check if they have request a login code in the last 5 minutes

  // 3. If user exists and has requested a login code in the last 5 minutes, send a 403

  // 4. If user exists and has not requested a login code in the last 5 minutes, generate a login code and send it to the user's email

  // 5. If user does not exist, create a new user

  // 6. Generate a login code and send it to the user's email
};
