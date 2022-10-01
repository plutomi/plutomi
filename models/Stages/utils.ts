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

  const sortedStages = [];
  sortedStages.push(firstStage);

  // Push all but the first stage into an object so we can get *almost* O(1) queries
  unsortedStagesInOpening.slice(1).map((stage) => {
    mapWithStages[stage.stageId] = stage;
  });

  let reachedTheEnd = false;

  while (!reachedTheEnd) {
    const nextStage = mapWithStages[firstStage.nextStageId];
    sortedStages.push(nextStage);

    if (!nextStage.nextStageId) {
      reachedTheEnd = true;
    }
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
