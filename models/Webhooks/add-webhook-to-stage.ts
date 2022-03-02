import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import * as Time from "../../utils/time";
import { SdkError } from "@aws-sdk/types";
import { AddWebhookToStageInput } from "../../types/main";
/**
 * This creates an adjacent item since there is a one to many relationship
 * between webhooks and stages, exactly how questions are setup.
 * The only real difference is that we create the webhook Ids and
 * there is no need to keep the order of the webhooks
 *
 * @param props
 * @returns
 */
export default async function AddWebhookToStage(
  props: AddWebhookToStageInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, openingId, stageId, webhookId } = props;

  const params = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.WEBHOOK}#${webhookId}#${ENTITY_TYPES.WEBHOOK}S`,
    SK: `${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
    entityType: ENTITY_TYPES.WEBHOOK,
    createdAt: Time.currentISO(),
    orgId,
    openingId,
    stageId,
  };

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Create the adjacent item
        Put: {
          Item: params,
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: "attribute_not_exists(PK)",
        },
      },
      {
        /**
         * If adding many webhooks to a stage,
         * there is a chance that the transaction will fail, make sure to wait in between each call
         * { Code: 'TransactionConflict',
         * Item: undefined,
         * Message: 'Transaction is ongoing for the item'}
         */
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
            SK: ENTITY_TYPES.STAGE,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression:
            "SET totalWebhooks = if_not_exists(totalWebhooks, :zero) + :value",
          ExpressionAttributeValues: {
            ":zero": 0,
            ":value": 1,
          },
        },
      },
      {
        // Update the totalStages count on the webhook
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.WEBHOOK}#${webhookId}`,
            SK: ENTITY_TYPES.WEBHOOK,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression:
            "SET totalStages = if_not_exists(totalStages, :zero) + :value",
          ExpressionAttributeValues: {
            ":zero": 0,
            ":value": 1,
          },
        },
      },
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
