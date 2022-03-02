import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { SdkError } from "@aws-sdk/types";
import { DeleteWebhookFromStageInput } from "../../types/main";

export default async function DeleteWebhookFromStage(
  props: DeleteWebhookFromStageInput
): Promise<[null, SdkError]> {
  const { orgId, openingId, stageId, webhookId, decrementStageCount } = props;

  let transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete the adjacent item
        Delete: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.WEBHOOK}#${webhookId}#${ENTITY_TYPES.WEBHOOK}S`,
            SK: `${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: "attribute_exists(PK)",
        },
      },
      // Decrement the totalWebhooks count on the stage
      {
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
            SK: ENTITY_TYPES.STAGE,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: "SET totalWebhooks = totalWebhooks - :value",
          ExpressionAttributeValues: {
            ":value": 1,
          },
        },
      },
    ],
  };

  if (decrementStageCount) {
    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.WEBHOOK}#${webhookId}`,
          SK: ENTITY_TYPES.WEBHOOK,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: "SET totalStages = totalStages - :value",
        ExpressionAttributeValues: {
          ":value": 1,
        },
      },
    });
  }

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
