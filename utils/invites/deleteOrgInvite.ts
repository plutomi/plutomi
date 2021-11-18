import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";
import { DeleteOrgInviteInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 * Deletes an org invite
 * @param props {@link DeleteOrgInviteInput}
 * @returns
 */
export default async function deleteOrgInvite(
  props: DeleteOrgInviteInput
): Promise<void> {
  const { userId, inviteId } = props;
  try {
    const params: DeleteCommandInput = {
      Key: {
        PK: `${ENTITY_TYPES.USER}#${userId}`,
        SK: `${ENTITY_TYPES.ORG_INVITE}#${inviteId}`,
      },
      TableName: DYNAMO_TABLE_NAME,
    };

    await Dynamo.send(new DeleteCommand(params));
    return;
  } catch (error) {
    throw new Error(`Unable to delete invite ${error}`);
  }
}
