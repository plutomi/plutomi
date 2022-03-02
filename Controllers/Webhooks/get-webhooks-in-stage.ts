import { Request, Response } from "express";
import * as CreateError from "../../utils/createError";
import * as Webhooks from "../../models/Webhooks";

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;

  // TODO types
  const { openingId, stageId } = req.params;

  const [webhookAdjacentItems, webhooksAdjacentItemsError] =
    await Webhooks.GetWebhooksInStage({
      openingId,
      stageId,
      orgId: session.orgId,
    });

  if (webhooksAdjacentItemsError) {
    const { status, body } = CreateError.SDK(
      webhooksAdjacentItemsError,
      "Unable to retrieve the current webhooks for this stage"
    );
    return res.status(status).json(body);
  }

  // No webhooks in this stage
  if (webhookAdjacentItems.length === 0) {
    return res.status(200).json([]);
  }

  try {
    // Get the full data for each webhook
    const webhookResults = await Promise.all(
      webhookAdjacentItems.map(async (adjacentWebhook) => {
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

    return res.status(200).json(webhookResults);
  } catch (error) {
    const { status, body } = CreateError.SDK(
      error,
      "An error ocurred retrieving the webhooks for this stage"
    );
    return res.status(status).json(body);
  }
};

export default main;
