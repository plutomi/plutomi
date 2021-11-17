import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";
import { DynamoNewUser } from "../../types/dynamo";
const { DYNAMO_TABLE_NAME } = process.env;

export async function getUserByEmail(email: string): Promise<DynamoNewUser> {
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI2",
    KeyConditionExpression: "GSI2PK = :GSI2PK AND GSI2SK = :GSI2SK",
    ExpressionAttributeValues: {
      ":GSI2PK": email.toLowerCase().trim(),
      ":GSI2SK": ENTITY_TYPES.USER,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items[0] as DynamoNewUser; // TODO
    // TODO are we sure the first item will be the user? Switch this to .find
  } catch (error) {
    throw new Error(error);
  }
}
