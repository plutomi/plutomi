import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { DynamoOpening } from "../../types/dynamo";
import { GetOpeningsInOrgInput } from "../../types/main";
import { SdkError } from "@aws-sdk/types";
export default async function GetOpenings(
  props: GetOpeningsInOrgInput
): Promise<[DynamoOpening[], null] | [null, SdkError]> {
  const { orgId, GSI1SK } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}S`,
    },
  };

  // Sort private or public. Optional. Retrieves all by default
  if (GSI1SK) {
    params.KeyConditionExpression += " AND GSI1SK = :GSI1SK";
    params.ExpressionAttributeValues[":GSI1SK"] = GSI1SK;
  }

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoOpening[], null];
  } catch (error) {
    return [null, error];
  }
}
