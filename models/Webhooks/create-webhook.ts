import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES, DYNAMO_TABLE_NAME } from "../../Config";
import { DynamoWebhook } from "../../types/dynamo";
import * as Time from "../../utils/time";
import { SdkError } from "@aws-sdk/types";
import { CreateWebhookInput } from "../../types/main";
export default async function CreateWebhook(
  props: CreateWebhookInput
): Promise<[DynamoWebhook, SdkError]> {
  const { orgId, webhookName, webhookUrl, description } = props;
  const webhookId = nanoid(15);
  let newWebhook: DynamoWebhook = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.WEBHOOK}#${webhookId}`,
    SK: ENTITY_TYPES.WEBHOOK,
    entityType: ENTITY_TYPES.WEBHOOK,
    createdAt: Time.currentISO(),
    webhookId,
    webhookName,
    totalStages: 0,
    orgId,
    webhookUrl,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.WEBHOOK}S`,
    GSI1SK: Time.currentISO(),
  };

  if (description) {
    newWebhook["description"] = description;
  }

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Create the webhook
        Put: {
          Item: newWebhook,
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: "attribute_not_exists(PK)",
        },
      },
      {
        // Increment the org's total webhooks
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}`,
            SK: ENTITY_TYPES.ORG,
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
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [newWebhook, null];
  } catch (error) {
    return [null, error];
  }
}
