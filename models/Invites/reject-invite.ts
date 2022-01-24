import { DeleteCommandInput, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DeleteOrgInviteInput } from "../../types/main";
import { SdkError } from "@aws-sdk/types";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 * Deletes an org invite, called when a user rejects an invite to an org
 * @param props {@link DeleteOrgInviteInput}
 * @returns
 */
export default async function DeleteInvite(
  props: DeleteOrgInviteInput
): Promise<[null, null] | [null, SdkError]> {
  const { userId, inviteId } = props;
  try {
    const params: DeleteCommandInput = {
      Key: {
        PK: `${ENTITY_TYPES.USER}#${userId}`,
        SK: `${ENTITY_TYPES.ORG_INVITE}#${inviteId}`,
      },
      TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

      ConditionExpression: "attribute_exists(PK)",
    };

    await Dynamo.send(new DeleteCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
