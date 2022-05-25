import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { ENTITY_TYPES, DEFAULTS, DYNAMO_TABLE_NAME } from '../../Config';
import { LeaveAndDeleteOrgInput } from '../../types/main';

export default async function Create(
  props: LeaveAndDeleteOrgInput,
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, userId } = props;

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Update user with new org
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: ENTITY_TYPES.USER,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: 'SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK',
            ExpressionAttributeValues: {
              ':orgId': DEFAULTS.NO_ORG,
              ':orgJoinDate': DEFAULTS.NO_ORG,
              ':GSI1PK': DEFAULTS.NO_ORG,
            },
            ConditionExpression: 'attribute_exists(PK)',
          },
        },
        {
          // Delete the org - // TODO delete all children asynchronously
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}`,
              SK: ENTITY_TYPES.ORG,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
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
}
