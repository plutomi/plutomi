import { nanoid } from 'nanoid';
import { TransactWriteCommand, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import getNewChildItemOrder from '../../utils/getNewChildItemOrder';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { ID_LENGTHS, Entities, LIMITS, DYNAMO_TABLE_NAME } from '../../Config';
import { DynamoOpening, DynamoStage } from '../../types/dynamo';
import * as Time from '../../utils/time';

export interface CreateStageInput extends Pick<DynamoStage, 'orgId' | 'GSI1SK' | 'openingId'> {
  /**
   * Optional position on where to place the new opening, optional. Added to the end if not provided
   */
  position?: number;
}

// TODO move this to utils
interface GetAdjacentStagesBasedOnPositionProps {
  position?: number;
  otherStages: DynamoStage[];
}
interface AdjacentStagesResult {
  nextStageId?: string;
  previousStageId?: string;
}

// TODO make this a reusable function so that it can be used for questions
const sortStages = (unsortedStagesInOpening: DynamoStage[]) => {
  if (!unsortedStagesInOpening.length) return [];
  // 1. Find the current first stage
  // 2. Create an object with all of the stages
  // 3. Sort the Object.values by traversing the nextStageId starting with the first node

  const mapWithStages = {};
  const firstStage = unsortedStagesInOpening.find((stage) => stage.previousStageId === undefined);
  mapWithStages['0'] = firstStage;

  const moreThanOneStage = unsortedStagesInOpening.length > 1;

  if (!moreThanOneStage) {
    return [firstStage];
  }

  // Get the rest of the stages and add them to the object, the sort order does not matter here
  const sortedStages = [];

  const restOfStages = unsortedStagesInOpening.slice(1);

  // Push them into the object
  restOfStages.map((stage, idx) => {
    // +1 Required since we already have the first stage
    mapWithStages[idx + 1] = stage;
  });

  // At this point our map will be full of stages, and we can easily traverse it at *almost* O(1)
  // instead of filtering the list each time

  sortedStages.push(firstStage);

  let reachedTheEnd = false;

  while (!reachedTheEnd) {
    // TODO cleanup
  }
};

const getAdjacentStagesBasedOnPosition = ({
  position,
  otherStages,
}: GetAdjacentStagesBasedOnPositionProps): AdjacentStagesResult => {
  if (position === undefined) {
    // Position not provided, add it to the end
    return {
      nextStageId: undefined,
      previousStageId: otherStages[otherStages.length - 1]?.stageId ?? undefined,
    };
  }

  if (position === 0) {
    // First in the list, get the current first stage
    return {
      previousStageId: undefined,
      nextStageId: otherStages[0]?.stageId ?? undefined,
    };
  }

  // Somewhere in the middle

  // TODO needs function to sort all stages in an opening using hash map
  // Then, get stage at specific position
  return {};
};
// TODO this should take a position OR a nextStageId OR previousStageId
// For now, this will only take a position and we will handle it
export const createStage = async (props: CreateStageInput): Promise<[null, null] | [null, any]> => {
  const { orgId, GSI1SK, openingId, position } = props;
  const stageId = nanoid(ID_LENGTHS.STAGE);
  const now = Time.currentISO();

  const newStage: DynamoStage = {
    PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
    SK: Entities.STAGE,
    entityType: Entities.STAGE,
    createdAt: now,
    updatedAt: now,
    stageId,
    nextStageId: 'TOOOODOO',
    previousStageId: 'TODOOOOOO',
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
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
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
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
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
