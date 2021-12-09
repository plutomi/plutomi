import {
  DeleteCommand,
  PutCommand,
  PutCommandInput,
  DeleteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../awsClients/ddbDocClient";
import { getOrgInvitesForUser } from "./getOrgInvitesForUser";
import * as Time from "./../utils/time";
import { nanoid } from "nanoid";
import { ENTITY_TYPES, ID_LENGTHS } from "../Config";
import { DynamoNewOrgInvite } from "../types/dynamo";
import { CreateOrgInviteInput, DeleteOrgInviteInput } from "../types/main";

const { DYNAMO_TABLE_NAME } = process.env;

/**
 * Invites a user to join your org
 * @param props {@link CreateOrgInviteInput}
 * @returns
 */
export const createInvite = async (
  props: CreateOrgInviteInput
): Promise<void> => {
  const { orgId, expiresAt, createdBy, recipient, orgName } = props;
  try {
    // TODO move this to controller, it should not be here

    if (recipient.orgId === orgId) {
      throw "User is already in your org"; // todo errors enum
    }

    // TODO move this to controller, it should not be here
    // Check if the user we are inviting already has pending invites for the current org
    const allUserInvites = await getOrgInvitesForUser({
      userId: recipient.userId,
    });
    const pendingInvites = allUserInvites.find(
      (invite) => invite.orgId === orgId
    );

    if (pendingInvites) {
      // TODO errors enum
      throw `This user already has a pending invite to your org! They can log in to claim it.`; // todo enum
    }
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

    return;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

/**
 * Deletes an org invite, called when a user rejects an invite to an org
 * @param props {@link DeleteOrgInviteInput}
 * @returns
 */
export const deleteOrgInvite = async (
  props: DeleteOrgInviteInput
): Promise<void> => {
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
};
