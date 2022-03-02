import { Request, Response } from "express";
import * as CreateError from "../../utils/createError";
import * as Webhooks from "../../models/Webhooks";
const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { openingId, stageId, webhookId } = req.params;

  const [updated, updateError] = await Webhooks.DeleteWebhookFromStage({
    decrementStageCount: true,
    openingId,
    stageId,
    orgId: session.orgId,
    webhookId,
  });

  if (updateError) {
    const { status, body } = CreateError.SDK(
      updateError,
      "An error ocurred deleting that webhook"
    );
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: "Webhook removed from stage!" });
};
export default main;
