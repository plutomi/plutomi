import type { RequestHandler } from "express";
import { Schema, validate } from "@plutomi/validation";
import dayjs from "dayjs";
import {
  IdPrefix,
  RelatedToType,
  type WaitListUser,
  type Email
} from "@plutomi/shared";
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

  try {
    const now = dayjs();
    const nowIso = now.toISOString();
    const userId = generatePlutomiId({
      date: now.toDate(),
      idPrefix: IdPrefix.WAIT_LIST_USER
    });

    const waitListUser: WaitListUser = {
      _id: userId,
      entityType: IdPrefix.WAIT_LIST_USER,
      email: email as Email,
      created_at: nowIso,
      updated_at: nowIso,
      related_to: [
        {
          id: IdPrefix.WAIT_LIST_USER,
          type: RelatedToType.ENTITY
        },
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
    res.status(500).json({
      message: "An error ocurred adding you to our wait list!"
    });
  }
};
