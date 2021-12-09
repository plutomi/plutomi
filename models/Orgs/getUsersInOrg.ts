import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewUser } from "../../types/dynamo";
import { GetAllUsersInOrgInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
export default async function getUsers(
  props: GetAllUsersInOrgInput
): Promise<DynamoNewUser[]> {
  const { orgId, limit } = props;
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.USER}S`,
    },
    Limit: limit || null,
  }; // TODO query until all results are returned

  limit && (params.Limit = limit);

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items as DynamoNewUser[];
  } catch (error) {
    throw new Error(error);
  }
}
