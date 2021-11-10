import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

export async function GetAllUsersInOrg({
  orgId,
  limit,
}: {
  orgId: string;
  limit?: number;
}) {
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `ORG#${orgId}#USERS`,
    },
    Limit: limit || null,
  }; // TODO query until all results are returned

  limit && (params.Limit = limit);

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items;
  } catch (error) {
    throw new Error(error);
  }
}
