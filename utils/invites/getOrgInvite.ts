import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../defaults";
import { DynamoNewOrgInvite } from "../../types/dynamo";
import { GetOrgInviteInput } from "../../types/main";

const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Returns a specific org invite by `userId` and `inviteId`
 * @param userId
 * @param inviteId
 * @returns - {@link DynamoNewOrgInvite}
 */
export async function getOrgInvite(
  props: GetOrgInviteInput
): Promise<DynamoNewOrgInvite> {
  const { userId, inviteId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `${ENTITY_TYPES.USER}#${userId}`,
      SK: `${ENTITY_TYPES.ORG_INVITE}#${inviteId}`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item as DynamoNewOrgInvite;
  } catch (error) {
    throw new Error(error);
  }
}
