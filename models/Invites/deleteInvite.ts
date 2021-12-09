import { DeleteCommandInput, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DeleteOrgInviteInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 * Deletes an org invite, called when a user rejects an invite to an org
 * @param props {@link DeleteOrgInviteInput}
 * @returns
 */
export default async function deleteInvite(
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
