import { Dynamo } from "../../libs/ddbDocClient";
import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
const { DYNAMO_TABLE_NAME } = process.env;

export async function GetAllFunnelsInOrg(org_id: string) {
  console.log("Query", `ORG#${org_id}#FUNNELS`);
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `ORG#${org_id}#FUNNELS`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items;
  } catch (error) {
    throw new Error(error);
  }
}
