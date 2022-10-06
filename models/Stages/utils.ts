import { NO_STAGE } from '../../Config';
import { DynamoStage } from '../../types/dynamo';

interface GetAdjacentStagesBasedOnPositionProps {
  position?: number;
  otherStages: DynamoStage[];
}
interface AdjacentStagesResult {
  nextStageId?: string;
  previousStageId?: string;
}

export const sortStages = (unsortedStagesInOpening: DynamoStage[]): DynamoStage[] => {
  if (!unsortedStagesInOpening.length) return [];
  if (unsortedStagesInOpening.length === 1) return unsortedStagesInOpening; // No need to sort

  let firstStage: DynamoStage;
  let firstStageIndex: number;
  const findFirstStage = (unsortedStagesInOpening: DynamoStage[]) => {
    unsortedStagesInOpening.find((stage, idx) => {
      if (stage.previousStageId === NO_STAGE) {
        firstStage = stage;
        firstStageIndex = idx;
      }
    });
  };

  findFirstStage(unsortedStagesInOpening);
  const sortedStages = [];
  sortedStages.push(firstStage);

  // Remove the first stage from the unsorted list, it is no longer needed
  unsortedStagesInOpening.splice(firstStageIndex, 1);

  console.log(`REST OF UNSORTED STAGES`, unsortedStagesInOpening);
  // Push all but the first stage into an object so we can get *almost* O(1) queries

  const mapWithStages: Record<string, DynamoStage> = {};
  unsortedStagesInOpening.map((stage) => {
    mapWithStages[stage.stageId] = stage;
  });

  console.log(`map with stages`, mapWithStages);

  let reachedTheEnd = false;
  let startingStage = firstStage;

  console.log(`Starting sort... first stage`, firstStage);
  while (!reachedTheEnd) {
    // This is due to stupid Dynamo shit where you cant set values as undefined. So we're also handling empty strings. FFS.
    const noNextStage = startingStage.nextStageId === NO_STAGE;
    console.log(`No next stage:`, noNextStage);

    if (noNextStage) {
      reachedTheEnd = true;
      break;
    }

    const nextStage = mapWithStages[startingStage.nextStageId];
    sortedStages.push(nextStage);
    console.log(`Designated next stage`, nextStage);
    console.log(`Sorted stages at this point`, sortedStages);
    // Dynamo doesn't allow undefined -_-
    if (nextStage.nextStageId === NO_STAGE) {
      reachedTheEnd = true;
      break;
    }
    startingStage = nextStage;
    // Continue loop until all stages are sorted
  }
  return sortedStages;
};

// TODO fix types
export const getAdjacentStagesBasedOnPosition = ({
  position,
  otherStages,
}: GetAdjacentStagesBasedOnPositionProps): AdjacentStagesResult => {
  if (position === undefined) {
    // Position not provided, add it to the end
    return {
      nextStageId: NO_STAGE, // Dynamo doesn't allow undefined
      previousStageId: otherStages[otherStages.length - 1]?.stageId ?? NO_STAGE, // Dynamo doesn't allow undefined,
    };
  }

  if (position === 0) {
    // First in the list, get the current first stage
    return {
      previousStageId: NO_STAGE, // Dynamo doesn't allow undefined,
      nextStageId: otherStages[0]?.stageId ?? NO_STAGE, // Dynamo doesn't allow undefined,
    };
  }

  const sortedStages = sortStages(otherStages);

  return {
    previousStageId: sortedStages[position]?.stageId ?? NO_STAGE, // Dynamo doesn't allow undefined,
    nextStageId: sortedStages[position]?.stageId ?? NO_STAGE, // Dynamo doesn't allow undefined,
  };
};
