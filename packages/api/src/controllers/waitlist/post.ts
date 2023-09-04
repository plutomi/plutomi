import type { RequestHandler } from "express";
import { Schema, validate } from "@plutomi/validation";
import { IdPrefix, RelatedToType, type WaitListUser } from "@plutomi/shared";
import { MongoError } from "mongodb";
import { generatePlutomiId } from "../../utils";

export const post: RequestHandler = async (req, res) => {
  const { data, errorHandled } = validate({
    req,
    res,
    schema: Schema.Subscribe.APISchema
  });

  if (errorHandled) {
    return;
  }

  const { email } = data;

  const now = new Date();

  try {
    const userId = generatePlutomiId({
      date: now,
      idPrefix: IdPrefix.WAIT_LIST_USER
    });

    const waitListUser: WaitListUser = {
      _id: userId,
      _type: IdPrefix.WAIT_LIST_USER,
      _locked_at: generatePlutomiId({
        date: now,
        idPrefix: IdPrefix.LOCKED_AT
      }),
      email,
      created_at: now,
      updated_at: now,
      related_to: [
        {
          id: userId,
          type: RelatedToType.SELF
        }
      ]
    };
    await req.items.insertOne(waitListUser);

    res.status(201).json({
      message:
        "Thanks for your interest! Make sure to check out Plutomi on GitHub!"
    });
  } catch (error) {
    if (error instanceof MongoError && error.code === 11000) {
      res.status(409).json({
        message: "You are already on the wait list! 😅"
      });
      return;
    }

    res.status(500).json({
      message: "An error ocurred adding you to our wait list!"
    });
  }
};
