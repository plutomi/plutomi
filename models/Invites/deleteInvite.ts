import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import * as Time from '../../utils/time';
interface RejectOrgInviteInput {
  userId: string;
  inviteId: string;
}

/**
 * Rejects an invite and deletes it
 */
export const deleteInvite = async (
  props: RejectOrgInviteInput,
): Promise<[null, null] | [null, any]> => {
  const { userId, inviteId } = props;
  const now = Time.currentISO();
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the invite
          Delete: {
            Key: {
              PK: `${Entities.USER}#${userId}`,
              SK: `${Entities.ORG_INVITE}#${inviteId}`,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: 'attribute_exists(PK)',
          },
        },
        {
          // Decrement the recipient's total invites
          Update: {
            Key: {
              PK: `${Entities.USER}#${userId}`,
              SK: Entities.USER,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: 'SET totalInvites = totalInvites - :value, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
              ':value': 1,
              ':updatedAt': now,
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
