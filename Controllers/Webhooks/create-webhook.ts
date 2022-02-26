import { Request, Response } from "express";
import { JOI_SETTINGS, LIMITS } from "../../Config";
import * as CreateError from "../../utils/createError";
import { DynamoWebhook } from "../../types/dynamo";
import * as Webhooks from "../../models/Webhooks";
import Joi from "joi";

export type APICreateWebhookOptions = Pick<
  DynamoWebhook,
  "url" | "name" | "description"
>;

const schema = Joi.object({
  body: {
    url: Joi.string().uri(),
    name: Joi.string().max(100).min(1),
    description: Joi.string()
      .allow("")
      .max(LIMITS.MAX_WEBHOOK_DESCRIPTION_LENGTH)
      .optional(),
  },
}).options(JOI_SETTINGS);

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { url, name, description }: APICreateWebhookOptions = req.body;

  const [created, createWebhookError] = await Webhooks.CreateWebhook({
    orgId: session.orgId,
    url,
    description,
    name,
  });

  if (createWebhookError) {
    const { status, body } = CreateError.SDK(
      createWebhookError,
      "An error ocurred creating that webhook"
    );
    return res.status(status).json(body);
  }

  return res.status(201).json({ message: "Webhook created!" });
};
export default main;
