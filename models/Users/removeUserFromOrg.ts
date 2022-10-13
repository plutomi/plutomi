import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DEFAULTS, DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import * as Time from '../../utils/time';
interface RemoveUserFromOrgInput {
  /**
   * The ID of the org the user is in
   */
  orgId: string;
  /**
   * The ID of the user you want to remove
   */
  userId: string;
  /**
   * The ID of the person who created the org
   */
  createdById: string;
}

export const removeUserFromOrg = async (
  props: RemoveUserFromOrgInput,
): Promise<[null, null] | [null, any]> => {
  const { userId, createdById, orgId } = props;
  const now = Time.currentISO();
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Remove the user from the org
          Update: {
            Key: {
              PK: `${Entities.USER}#${userId}`,
              SK: Entities.USER,
            },
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression:
              'SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
              ':orgId': DEFAULTS.NO_ORG,
              ':orgJoinDate': DEFAULTS.NO_ORG,
              ':GSI1PK': `${Entities.ORG}#${DEFAULTS.NO_ORG}#${Entities.USER}S`,
              ':updatedAt': now,
            },
          },
        },
        {
          // Decrement the orginal org's total users
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}`,
              SK: Entities.ORG,
            },
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: 'SET totalUsers = totalUsers - :value, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
              ':value': 1,
              ':createdBy': createdById,
              ':updatedAt': now,
            },
            // Only allow the org creator to remove users // TODO RBAC
            ConditionExpression: 'attribute_exists(PK) AND createdBy = :createdBy',
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
