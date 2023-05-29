import type { RequestHandler } from "express";
import { Schema, validate } from "@plutomi/validation";
import dayjs from "dayjs";
import { IdPrefix, type Email, RelatedToType } from "@plutomi/shared";
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
      entity: IdPrefix.WAIT_LIST_USER
    });

    await req.items.insertOne({
      _id: userId,
      entityType: IdPrefix.WAIT_LIST_USER,
      email: email as Email,
      createdAt: nowIso,
      updatedAt: nowIso,
      relatedTo: [
        {
          id: userId,
          type: RelatedToType.SELF
        },
        {
          id: email as Email,
          type: RelatedToType.WAIT_LIST_USERS
        }
      ]
    });

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
