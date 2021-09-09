import { Dynamo } from "../../libs/ddbDocClient";
import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime } from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

export async function JoinOrg({ user_id, org_id }: JoinOrgInput) {
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
      ":org_join_date": GetCurrentTime("iso"),
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
