import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;

export async function GetOrgInvite({
  user_id,
  invite_id,
  timestamp,
}: GetOrgInviteInput) {
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `USER#${user_id}`,
      SK: `ORG_INVITE#${timestamp}#INVITE_ID#${invite_id}`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item;
  } catch (error) {
    throw new Error(error);
  }
}
