import { Request, Response } from "express";
import Joi from "joi";
import { JOI_SETTINGS, LIMITS } from "../../Config";
import * as CreateError from "../../utils/createError";
import * as Stages from "../../models/Stages";
import getNewChildItemOrder from "../../utils/getNewChildItemOrder";
import * as Questions from "../../models/Questions";
import * as Webhooks from "../../models/Webhooks";
const schema = Joi.object({
  body: {
    webhookId: Joi.string(),
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

  // TODO types
  let { webhookId }: { webhookId: string } = req.body;
  const { openingId, stageId } = req.params;

  const [newWebhook, getWebhookError] = await Webhooks.GetWebhookById({
    orgId: session.orgId,
    webhookId,
  });

  if (getWebhookError) {
    const { status, body } = CreateError.SDK(
      getWebhookError,
      "An error ocurred retrieving info for that webhook"
    );
    return res.status(status).json(body);
  }

  if (!newWebhook) {
    return res.status(404).json({
      message: `A webhook with the ID of '${webhookId}' does not exist in this org`,
    });
  }

  const [webhooksInStage, webhooksInStageError] =
    await Webhooks.GetWebhooksInStage({
      openingId,
      stageId,
      orgId: session.orgId,
    });

  if (webhooksInStageError) {
    const { status, body } = CreateError.SDK(
      webhooksInStageError,
      "Unable to retrieve the current webhooks for this stage"
    );
    return res.status(status).json(body);
  }

  // Check if any webhooks in this stage have the same URL as the one that is about to be added
  if (webhooksInStage.length > 0) {
    try {
      // Get the full data for each webhook
      const webhookResults = await Promise.all(
        webhooksInStage.map(async (adjacentWebhook) => {
          const [webhook, error] = await Webhooks.GetWebhookById({
            orgId: session.orgId,
            webhookId: adjacentWebhook.webhookId,
          });

          if (error) {
            console.error(error);
            throw "An error ocurred retrieving the webhook info for this stage";
          }
          return webhook;
        })
      );

      if (
        webhookResults.some(
          (webhook) => webhook.webhookUrl === newWebhook.webhookUrl
        )
      ) {
        return res.status(409).json({
          message: `A webhook with the URL of '${newWebhook.webhookUrl}' already exists in this stage.`,
        });
      }
    } catch (error) {
      const { status, body } = CreateError.SDK(
        error,
        "An error ocurred retrieving the webhooks for this stage"
      );
      return res.status(status).json(body);
    }
  }

  const [webhookAdded, webhookAddedError] = await Webhooks.AddWebhookToStage({
    orgId: session.orgId,
    openingId,
    stageId,
    webhookId,
  });

  if (webhookAddedError) {
    const { status, body } = CreateError.SDK(
      webhookAddedError,
      "An error ocurred adding this webhook to the stage"
    );
    return res.status(status).json(body);
  }

  return res.status(201).json({ message: "Webhook added to stage!" });
};
export default main;
