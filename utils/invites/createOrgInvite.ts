import {
  PutCommand,
  PutCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { getAllOrgInvites } from "./getAllOrgInvites";
import Time from "../time";
import { nanoid } from "nanoid";
import { ENTITY_TYPES, ID_LENGTHS } from "../../defaults";
import { DynamoNewOrgInvite } from "../../types/dynamo";
import { CreateOrgInviteInput } from "../../types/main";

const { DYNAMO_TABLE_NAME } = process.env;

export default async function createOrgInvite(props: CreateOrgInviteInput) {
  const { orgId, expiresAt, createdBy, recipient, orgName } = props;
  try {
    if (recipient.orgId === orgId) {
      throw "User is already in your org";
    }

    // Check if the user we are inviting already has pending invites for the current org
    const pendingInvites = await getAllOrgInvites(recipient.userId);
    const unclaimedInvites = pendingInvites.filter(
      (invite) => invite.orgId == orgId
    );

    if (unclaimedInvites.length > 0) {
      // TODO errors enum
      throw `This user already has a pending invite to your org! They can log in at ${process.env.NEXT_PUBLIC_WEBSITE_URL}/invites to claim it!`;
    }
    const inviteId = nanoid(ID_LENGTHS.ORG_INVITE);
    const now = Time.currentISO();
    const newOrgInvite: DynamoNewOrgInvite = {
      PK: `${ENTITY_TYPES.USER}#${recipient.userId}`,
      SK: `${ENTITY_TYPES.ORG_INVITE}#${inviteId}`, // Allows sorting, and incase two get created in the same millisecond
      orgId: orgId,
      orgName: orgName, // using orgName here because GSI1SK is taken obv
      createdBy: createdBy,
      entityType: ENTITY_TYPES.ORG_INVITE,
      createdAt: now,
      expiresAt: expiresAt,
      inviteId: inviteId,
      GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.ORG_INVITE}S`,
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
}
