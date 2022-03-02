import * as Questions from "../models/Questions";
import * as Webhooks from "../models/Webhooks";

// TODO we do not need this lambda, and can be replaced with direct
// SDK call (transaction) in step functions

export async function main(event) {
  // TODO types
  console.log(JSON.stringify(event));
  const { stage } = event;

  // TODO types
  const input = {
    decrementStageCount: false,
    openingId: stage.openingId.S,
    orgId: stage.orgId.S,
    webhookId: event.webhookId,
    stageId: stage.stageId.S,
  };

  console.log(input);
  const [removed, error] = await Webhooks.DeleteWebhookFromStage(input);

  if (error) {
    console.error(error);
    return;
  }

  console.log("Removed!");
  return;
}
