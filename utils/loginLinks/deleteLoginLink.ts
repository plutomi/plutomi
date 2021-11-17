// Deletes the login link the user used to log in
import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";

const { DYNAMO_TABLE_NAME } = process.env;
export default async function deleteLoginLink(
  userId: string,
  loginLinkTimestmap: string
) {
  try {
    const params: DeleteCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Key: {
        PK: `${ENTITY_TYPES.USER}#${userId}`,
        SK: `${ENTITY_TYPES.LOGIN_LINK}#${loginLinkTimestmap}`,
      },
    };

    await Dynamo.send(new DeleteCommand(params));
    return;
  } catch (error) {
    throw new Error(`Unable to delete login link ${error}`);
  }
}
