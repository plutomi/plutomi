import { nanoid } from 'nanoid';
import { TransactWriteCommand, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import getNewChildItemOrder from '../../utils/getNewChildItemOrder';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { ID_LENGTHS, Entities, LIMITS, DYNAMO_TABLE_NAME } from '../../Config';
import { DynamoStage } from '../../types/dynamo';
import * as Time from '../../utils/time';
import { env } from '../../env';

export interface CreateStageInput extends Pick<DynamoStage, 'orgId' | 'GSI1SK' | 'openingId'> {
  /**
   * Optional position on where to place the new opening, optional. Added to the end if not provided
   */
  position?: number;
  // To figure out where to place it
  stageOrder: string[];
}

export const createStage = async (props: CreateStageInput): Promise<[null, null] | [null, any]> => {
  const { orgId, GSI1SK, openingId, position, stageOrder } = props;
  const stageId = nanoid(ID_LENGTHS.STAGE);
  const now = Time.currentISO();
  const newStage: DynamoStage = {
    PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
    SK: Entities.STAGE,
    entityType: Entities.STAGE,
    createdAt: now,
    updatedAt: now,
    stageId,
    questionOrder: [],
    orgId,
    totalApplicants: 0,
    totalQuestions: 0,
    openingId,
    GSI1PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}S`, // Get all stages in an opening
    GSI1SK,
  };

  const newStageOrder = getNewChildItemOrder(stageId, stageOrder, position);

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Add the new stage
          Put: {
            Item: newStage,
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: 'attribute_not_exists(PK)',
          },
        },
        {
          // Increment stage count on the opening and update the newStageOrder
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
              SK: Entities.OPENING,
            },
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: 'totalStages < :maxChildItemLimit AND attribute_exists(PK)',
            UpdateExpression:
              'SET totalStages = if_not_exists(totalStages, :zero) + :value, stageOrder = :stageOrder, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
              ':zero': 0,
              ':value': 1,
              ':stageOrder': newStageOrder,
              ':maxChildItemLimit': LIMITS.MAX_CHILD_ITEM_LIMIT,
              ':updatedAt': now,
            },
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
