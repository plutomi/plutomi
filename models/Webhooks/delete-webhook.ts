import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { DeleteWebhookFromOrgInput } from "../../types/main";
import { SdkError } from "@aws-sdk/types";
export default async function DeleteWebhookFromOrg(
  props: DeleteWebhookFromOrgInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, webhookId } = props;

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete webhook from org
        Delete: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.WEBHOOK}#${webhookId}`,
            SK: ENTITY_TYPES.WEBHOOK,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: "attribute_exists(PK)",
        },
      },
      {
        // Decrement the org's totalWebhooks
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}`,
            SK: ENTITY_TYPES.ORG,
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
  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
