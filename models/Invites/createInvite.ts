import { nanoid } from 'nanoid';
import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { ID_LENGTHS, Entities, DYNAMO_TABLE_NAME } from '../../Config';
import { DynamoOrgInvite, DynamoUser } from '../../types/dynamo';
import * as Time from '../../utils/time';

interface CreateOrgInviteInput {
  orgName: string;
  expiresAt: string;
  createdBy: Pick<DynamoUser, 'firstName' | 'lastName' | 'orgId'>;
  recipient: Pick<DynamoUser, 'userId' | 'email' | 'unsubscribeKey' | 'firstName' | 'lastName'>;
}

export const createInvite = async (
  props: CreateOrgInviteInput,
): Promise<[null, null] | [null, any]> => {
  const { expiresAt, createdBy, recipient, orgName } = props;
  try {
    const inviteId = nanoid(ID_LENGTHS.ORG_INVITE);
    const now = Time.currentISO();
    const newOrgInvite: DynamoOrgInvite = {
      PK: `${Entities.USER}#${recipient.userId}`,
      SK: `${Entities.ORG_INVITE}#${inviteId}`,
      orgId: createdBy.orgId,
      orgName,
      createdBy,
      recipient,
      entityType: Entities.ORG_INVITE,
      createdAt: now,
      expiresAt,
      inviteId,
      // TODO TTL
      GSI1PK: `${Entities.ORG}#${createdBy.orgId}#${Entities.ORG_INVITE}S`, // Returns all invites sent by an org
      GSI1SK: now,
    };
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Create the org invite
          Put: {
            Item: newOrgInvite,
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: 'attribute_not_exists(PK)',
          },
        },
        {
          // Increment the recipient's total invites
          Update: {
            Key: {
              PK: `${Entities.USER}#${recipient.userId}`,
              SK: Entities.USER,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: 'SET totalInvites = if_not_exists(totalInvites, :zero) + :value',
            ExpressionAttributeValues: {
              ':zero': 0,
              ':value': 1,
            },
            ConditionExpression: 'attribute_exists(PK)',
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
