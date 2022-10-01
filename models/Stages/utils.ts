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
  console.log(`Sorting stages`, unsortedStagesInOpening);
  if (!unsortedStagesInOpening.length) return [];
  if (unsortedStagesInOpening.length === 1) return unsortedStagesInOpening; // No need to sort

  const mapWithStages = {};
  const firstStage = unsortedStagesInOpening.find((stage) => stage.previousStageId === undefined);

  console.log(`In sort, first stage`, firstStage);
  const sortedStages = [];
  sortedStages.push(firstStage);

  console.log(`Sorted stages array, should just be the first stage`, firstStage);
  // Push all but the first stage into an object so we can get *almost* O(1) queries
  unsortedStagesInOpening.slice(1).map((stage) => {
    mapWithStages[stage.stageId] = stage;
  });

  console.log(`All other stages`, mapWithStages);
  let reachedTheEnd = false;

  // TODO infinite loop bug!!!!!!!!!!!!!!!
  while (!reachedTheEnd) {
    let startingStage = firstStage;
    console.log(`While loop starting`);
    console.log(`First stage's next stage id =`, startingStage.nextStageId);

    const nextStage = mapWithStages[startingStage.nextStageId];
    console.log(`The next stage is`, nextStage);
    sortedStages.push(nextStage);
    console.log(`Current state of sorted stages`);

    if (!nextStage.nextStageId) {
      reachedTheEnd = true;
    }
    startingStage = nextStage;
    // Continue loop until all stages are sorted
  }
  return sortedStages;
};

export const getAdjacentStagesBasedOnPosition = ({
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

  const sortedStages = sortStages(otherStages);

  return {
    previousStageId: sortedStages[position]?.stageId ?? undefined,
    nextStageId: sortedStages[position]?.stageId ?? undefined,
  };
};
