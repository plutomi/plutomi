// Deletes the login link the user used to log in
import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";
import { DeleteLoginLinkInput } from "../../types/main";

const { DYNAMO_TABLE_NAME } = process.env;
export default async function deleteLoginLink(
  props: DeleteLoginLinkInput
): Promise<void> {
  const { userId, loginLinkTimestmap } = props;
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
