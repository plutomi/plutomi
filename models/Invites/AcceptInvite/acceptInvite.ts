import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../../Config';
import { DynamoOrgInvite } from '../../../types/dynamo';
import * as Time from '../../../utils/time';

type AcceptInviteInput = {
  userId: string;
  invite: DynamoOrgInvite; // TODO I think the invite sent to the client is the clean version, need to verify this and if so make types for the clean version anyway
};

/**
 * Accepts an invite and joins an org
 */

export const acceptInvite = async (
  props: AcceptInviteInput,
): Promise<[null, null] | [null, SdkError]> => {
  const { userId, invite } = props;

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete org invite
          Delete: {
            Key: {
              PK: `${Entities.USER}#${userId}`,
              SK: `${Entities.ORG_INVITE}#${invite.inviteId}`,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: 'attribute_exists(PK)',
          },
        },

        {
          // Update the user with the new org
          Update: {
            Key: {
              PK: `${Entities.USER}#${userId}`,
              SK: Entities.USER,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression:
              'SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK, totalInvites = totalInvites - :value',
            ExpressionAttributeValues: {
              ':orgId': invite.orgId,
              ':orgJoinDate': Time.currentISO(),
              ':GSI1PK': `${Entities.ORG}#${invite.orgId}#${Entities.USER}S`,
              ':value': 1,
            },
            ConditionExpression: 'attribute_exists(PK)',
          },
        },
        {
          // Increment the org with the new user
          Update: {
            Key: {
              PK: `${Entities.ORG}#${invite.orgId}`,
              SK: Entities.ORG,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: 'SET totalUsers = totalUsers + :value',
            ExpressionAttributeValues: {
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
