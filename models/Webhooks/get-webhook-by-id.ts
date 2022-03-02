import { GetCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { DynamoOpening, DynamoWebhook } from "../../types/dynamo";
import { SdkError } from "@aws-sdk/types";
import { GetWebhookByIdInput } from "../../types/main";
export default async function Get(
  props: GetWebhookByIdInput
): Promise<[DynamoWebhook, SdkError]> {
  const { orgId, webhookId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.WEBHOOK}#${webhookId}`,
      SK: ENTITY_TYPES.WEBHOOK,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoWebhook, null];
  } catch (error) {
    return [null, error];
  }
}
