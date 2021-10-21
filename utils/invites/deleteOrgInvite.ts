import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;
export default async function DeleteOrgInvite({ user_id, invite_id }) {
  try {
    const params: DeleteCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Key: {
        PK: `USER#${user_id}`,
        SK: `ORG_INVITE#${invite_id}`, // Allows sorting, and incase two get created in the same millisecond
      },
    };

    await Dynamo.send(new DeleteCommand(params));
    return;
  } catch (error) {
    throw new Error(`Unable to delete invite ${error}`);
  }
}
