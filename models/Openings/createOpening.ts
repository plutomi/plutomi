import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { nanoid } from 'nanoid';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { ID_LENGTHS, Entities, OpeningState, DYNAMO_TABLE_NAME } from '../../Config';
import { env } from '../../env';
import { DynamoOpening } from '../../types/dynamo';
import * as Time from '../../utils/time';

type CreateOpeningInput = Pick<DynamoOpening, 'orgId' | 'openingName'>;

export const createOpening = async (
  props: CreateOpeningInput,
): Promise<[DynamoOpening, null] | [null, any]> => {
  const { orgId, openingName } = props;
  const openingId = nanoid(ID_LENGTHS.OPENING);

  const now = Time.currentISO();
  const newOpening: DynamoOpening = {
    PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
    SK: Entities.OPENING,
    entityType: Entities.OPENING,
    createdAt: now,
    updatedAt: now,
    orgId,
    openingId,
    openingName,
    GSI1PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}S`,
    GSI1SK: OpeningState.PRIVATE, // All openings are private by default
    totalStages: 0,
    stageOrder: [],
    totalApplicants: 0,
  };

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Create the opening
        Put: {
          Item: newOpening,
          TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_not_exists(PK)',
        },
      },
      {
        // Increment the org's total openings
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}`,
            SK: Entities.ORG,
          },
          TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression:
            'SET totalOpenings = if_not_exists(totalOpenings, :zero) + :value, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':zero': 0,
            ':value': 1,
            ':updatedAt': now,
          },
        },
      },
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [newOpening, null];
  } catch (error) {
    return [null, error];
  }
};
