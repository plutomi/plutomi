import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

/**
 *  Allows a user to leave an org if:
 * 1. They are an admin
 * 2. They are the only ones in an org
 *
 * For those people that sign up, create an org to test things but cannot join another later. Issue #137
 */

// TODO - Major, delete all org assets
export async function LeaveOrg(user_id: string) {
  const params: UpdateCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `USER#${user_id}`,
      SK: `USER`,
    },
    UpdateExpression:
      "SET org_id = :org_id, org_join_date = :org_join_date, GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":org_id": "NO_ORG_ASSIGNED",
      ":org_join_date": "NO_ORG_ASSIGNED",
      ":GSI1PK": "NO_ORG_ASSIGNED",
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
}
