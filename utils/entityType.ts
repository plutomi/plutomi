import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../awsClients/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

export async function AllByType(entityType: string) {
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "AllByType",
    KeyConditionExpression: "entityType = :entityType",
    ExpressionAttributeValues: {
      ":entityType": entityType,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items;
  } catch (error) {
    throw new Error(error);
  }
}
