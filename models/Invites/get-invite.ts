import { GetCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DynamoOrgInvite } from "../../types/dynamo";
import { GetOrgInviteInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";

export default async function Get(
  props: GetOrgInviteInput
): Promise<[DynamoOrgInvite, null] | [null, SdkError]> {
  const { userId, inviteId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

    Key: {
      PK: `${ENTITY_TYPES.USER}#${userId}`,
      SK: `${ENTITY_TYPES.ORG_INVITE}#${inviteId}`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoOrgInvite, null];
  } catch (error) {
    return [null, error];
  }
}
