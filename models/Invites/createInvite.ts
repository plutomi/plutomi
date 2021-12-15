import { PutCommandInput, PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ID_LENGTHS, ENTITY_TYPES } from "../../Config";
import { DynamoNewOrgInvite } from "../../types/dynamo";
import { CreateOrgInviteInput } from "../../types/main";
import * as Time from "../../utils/time";
import * as Users from "../Users";
import { SdkError } from "@aws-sdk/types";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 * Invites a user to join your org
 * @param props {@link CreateOrgInviteInput}
 * @returns
 */
export default async function Create(
  props: CreateOrgInviteInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, expiresAt, createdBy, recipient, orgName } = props;
  try {
    const inviteId = nanoid(ID_LENGTHS.ORG_INVITE);
    const now = Time.currentISO();
    const newOrgInvite: DynamoNewOrgInvite = {
      PK: `${ENTITY_TYPES.USER}#${recipient.userId}`,
      SK: `${ENTITY_TYPES.ORG_INVITE}#${inviteId}`,
      orgId: orgId,
      orgName: orgName, // using orgName here because GSI1SK is taken obv
      createdBy: createdBy,
      entityType: ENTITY_TYPES.ORG_INVITE,
      createdAt: now,
      expiresAt: expiresAt,
      inviteId: inviteId,
      GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.ORG_INVITE}S`, // Returns all invites sent by an org
      GSI1SK: now,
    };

    const params: PutCommandInput = {
      Item: newOrgInvite,
      TableName: DYNAMO_TABLE_NAME,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));

    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
