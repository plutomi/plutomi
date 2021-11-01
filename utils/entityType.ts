import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../lib/awsClients/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

export async function AllByType(entity_type: string) {
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "AllByType",
    KeyConditionExpression: "entity_type = :entity_type",
    ExpressionAttributeValues: {
      ":entity_type": entity_type,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items;
  } catch (error) {
    throw new Error(error);
  }
}
