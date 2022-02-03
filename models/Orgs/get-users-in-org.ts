import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoUser } from "../../types/dynamo";
import { GetUsersInOrgInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";

export default async function GetUsers(
  props: GetUsersInOrgInput
): Promise<[DynamoUser[], null] | [null, SdkError]> {
  const { orgId, limit } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.USER}S`,
    },
  }; // TODO query until all results are returned

  limit && (params["Limit"] = limit);

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoUser[], null];
  } catch (error) {
    return [null, error];
  }
}
