// Deletes the login link the user used to log in
import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;
export default async function DeleteLoginLink(
  userId: string,
  loginLinkTimestmap: string
) {
  try {
    const params: DeleteCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `loginLink#${loginLinkTimestmap}`,
      },
    };

    await Dynamo.send(new DeleteCommand(params));
    return;
  } catch (error) {
    throw new Error(`Unable to delete login link ${error}`);
  }
}
