import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

export async function GetAllUsersInOrg(org_id: string) {
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `ORG#${org_id}#USERS`,
    },
  }; // TODO query until all results are returned

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items;
  } catch (error) {
    throw new Error(error);
  }
}
