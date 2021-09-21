import { Dynamo } from "../../libs/ddbDocClient";
import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCurrentTime } from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

export async function ClaimLoginCode({
  user_id,
  timestamp,
}: ClaimLoginCodeInput) {
  const params: UpdateCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `USER#${user_id}`,
      SK: `LOGIN_CODE#${timestamp}`,
    },
    UpdateExpression: "SET is_claimed = :is_claimed",
    ExpressionAttributeValues: {
      ":is_claimed": true,
    },
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
}
