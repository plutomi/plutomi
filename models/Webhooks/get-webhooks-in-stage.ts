import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { DynamoWebhook } from "../../types/dynamo";
import { GetWebhooksInStageInput } from "../../types/main";
import { SdkError } from "@aws-sdk/types";

// TODO this should be used in add webhook to stage call
interface AdjacentWebhookItem
  extends Pick<
    DynamoWebhook,
    "webhookId" | "orgId" | "createdAt" | "entityType"
  > {
  openingId: string;
  stageId: string;
  GSI1PK: string;
  GSI1SK: string;
}

export default async function GetWebhooksInStage(
  props: GetWebhooksInStageInput
): Promise<[AdjacentWebhookItem[], SdkError]> {
  const { orgId, openingId, stageId } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}#${ENTITY_TYPES.WEBHOOK}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as AdjacentWebhookItem[], null];
  } catch (error) {
    return [null, error];
  }
}
