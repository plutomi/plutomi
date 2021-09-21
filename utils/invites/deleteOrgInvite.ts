import { Dynamo } from "../../libs/ddbDocClient";
import { GetOrgInvite } from "./getOrgInvite";
import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;
export default async function DeleteOrgInvite({
  user_id,
  invite_id,
  timestamp,
}) {
  try {
    const params: DeleteCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Key: {
        PK: `USER#${user_id}`,
        SK: `ORG_INVITE#${timestamp}#INVITE_ID#${invite_id}`, // Allows sorting, and incase two get created in the same millisecond
      },
    };

    await Dynamo.send(new DeleteCommand(params));
    return;
  } catch (error) {
    throw new Error(`Unable to delete invite ${error}`);
  }
}
