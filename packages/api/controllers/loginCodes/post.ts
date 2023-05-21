import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler } from "express";

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

  // 2. If user exists, check if they have request a login code in the last 5 minutes

  // 3. If user exists and has requested a login code in the last 5 minutes, send a 403

  // 4. If user exists and has not requested a login code in the last 5 minutes, generate a login code and send it to the user's email

  // 5. If user does not exist, create a new user

  // 6. Generate a login code and send it to the user's email
};
