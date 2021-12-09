import {
  DeleteCommand,
  PutCommand,
  PutCommandInput,
  DeleteCommandInput,
  GetCommand,
  GetCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../awsClients/ddbDocClient";
import * as Time from "./../utils/time";
import * as Users from "../models/Users";
import { nanoid } from "nanoid";
import { ENTITY_TYPES, ID_LENGTHS } from "../Config";
import { DynamoNewOrgInvite } from "../types/dynamo";
import {
  CreateOrgInviteInput,
  DeleteOrgInviteInput,
  GetOrgInviteInput,
  JoinOrgFromInviteInput,
} from "../types/main";

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
    const allUserInvites = await Users.getInvitesForUser({
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
export const deleteInvite = async (
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

export const getInviteById = async (
  props: GetOrgInviteInput
): Promise<DynamoNewOrgInvite> => {
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
};

export const joinOrgFromInvite = async (
  props: JoinOrgFromInviteInput
): Promise<void> => {
  const { userId, invite } = props;
  // TODO types
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete org invite
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: `${ENTITY_TYPES.ORG_INVITE}#${invite.inviteId}`,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },

        {
          // Update the user with the new org
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: ENTITY_TYPES.USER,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK",
            ExpressionAttributeValues: {
              ":orgId": invite.orgId,
              ":orgJoinDate": Time.currentISO(),
              ":GSI1PK": `${ENTITY_TYPES.ORG}#${invite.orgId}#${ENTITY_TYPES.USER}S`,
            },
          },
        },
        {
          // Increment the org with the new user
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${invite.orgId}`,
              SK: ENTITY_TYPES.ORG,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET totalUsers = totalUsers + :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
