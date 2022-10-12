import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { Entities, DEFAULTS, DYNAMO_TABLE_NAME } from '../../Config';
import { env } from '../../env';
import * as Time from '../../utils/time';
interface LeaveAndDeleteOrgInput {
  orgId: string;
  userId: string;
}

export const leaveAndDeleteOrg = async (
  props: LeaveAndDeleteOrgInput,
): Promise<[null, null] | [null, any]> => {
  const { orgId, userId } = props;

  const now = Time.currentISO();
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Update user with "new" org (default)
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
              ':GSI1PK': DEFAULTS.NO_ORG,
              ':updatedAt': now,
            },
            ConditionExpression: 'attribute_exists(PK)',
          },
        },
        {
          // Delete the org - // TODO delete all children asynchronously
          Delete: {
            Key: {
              PK: `${Entities.ORG}#${orgId}`,
              SK: Entities.ORG,
            },
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
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
