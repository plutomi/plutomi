import { GetCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoNewOrgInvite } from "../../types/dynamo";
import { GetOrgInviteInput } from "../../types/main";
import * as Time from "../../utils/time";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function get(
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
