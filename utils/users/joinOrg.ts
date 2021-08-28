import { Dynamo } from "../../libs/ddbDocClient";
import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;
import { GetCurrentTime } from "../time";
export async function JoinOrg(user_id: string, org_id: string) {
  const now = GetCurrentTime("iso");

  const params: UpdateCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `USER#${user_id}`,
      SK: `USER`,
    },
    UpdateExpression:
      "SET org_id = :org_id, org_join_date = :org_join_date, GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":org_id": org_id,
      ":org_join_date": now,
      ":GSI1PK": `ORG#${org_id}#USERS`,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const response = await Dynamo.send(new UpdateCommand(params));
    return response.Attributes;
  } catch (error) {
    throw new Error(error);
  }
}
