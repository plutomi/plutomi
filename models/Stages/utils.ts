import { NO_STAGE } from '../../Config';
import { DynamoStage } from '../../types/dynamo';

interface GetAdjacentStagesBasedOnPositionProps {
  position?: number;
  otherStages: DynamoStage[];
  stageIdWeAreMoving: string;
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

  // TODO we could make this faster by mapping through all the stages  and adding them to the map, and skip it only if .previousStageId === NO_STAGE
  unsortedStagesInOpening.find((stage, idx) => {
    if (stage.previousStageId === NO_STAGE) {
      firstStage = stage;
      firstStageIndex = idx;
    }
  });

  const sortedStages = [];
  sortedStages.push(firstStage);

  // Remove the first stage from the unsorted list, it is no longer needed
  unsortedStagesInOpening.splice(firstStageIndex, 1);

  // Push all but the first stage into an object so we can get *almost* O(1) queries

  const mapWithStages: Record<string, DynamoStage> = {};
  unsortedStagesInOpening.map((stage) => {
    mapWithStages[stage.stageId] = stage;
  });

  let reachedTheEnd = false;
  let startingStage = firstStage;

  while (!reachedTheEnd) {
    const nextStage = mapWithStages[startingStage.nextStageId];
    sortedStages.push(nextStage);
    startingStage = nextStage;

    // Dynamo doesn't allow undefined -_-
    if (nextStage.nextStageId === NO_STAGE) {
      reachedTheEnd = true;
    }

    // Continue loop until all stages are sorted
  }

  return sortedStages;
};

// TODO fix types
export const getAdjacentStagesBasedOnPosition = ({
  position,
  otherStages,
  stageIdWeAreMoving,
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

  const sortedStages = sortStages(otherStages); // TODO move this out!!!!!!!!

  const currentIndex = sortedStages.findIndex((stage) => stage.stageId === stageIdWeAreMoving);

  /**
   * OLD --- NEW
   * New position: 1
   * Moving Stage One to the middle
   *
   * Stage 1                    -----  Stage 2
   * previous: NO_STAGE                previous: NO_STAGE
   * next: Stage 2                     next: Stage 1
   *
   * Stage 2                    ----- Stage 1
   * previous: Stage 1                previous: Stage 2 <------
   * next: Stage3                     next: Stage 3 <------
   *
   * Stage 3                    ----- Stage 3
   * previous: Stage 2                previous: Stage 1
   * next: NO_STAGE                   next: NO_STAGE
   *
   */

  /**
   * Stage is currently index 0, moving to position 1 above (2nd place) ie moving it "DOWN" the column
   */
  if (position >= currentIndex) {
    return {
      previousStageId: sortedStages[position]?.stageId ?? NO_STAGE, // We took this place and are now after it
      nextStageId: sortedStages[position + 1]?.stageId ?? NO_STAGE, // The old next stage
    };
  } else {
    /**
     * OLD --- NEW
     * New position: 1
     * Moving Stage One to the middle
     *
     * Stage 2                    -----  Stage 2
     * previous: NO_STAGE                previous: NO_STAGE
     * next: Stage 2                     next: Stage 1
     *
     * Stage 3                    ----- Stage 1
     * previous: Stage 1                previous: Stage 2 <------
     * next: Stage3                     next: Stage 3 <------
     *
     * Stage 1                    ----- Stage 3
     * previous: Stage 2                previous: Stage 1
     * next: NO_STAGE                   next: NO_STAGE
     *
     */
    /**
     * Stage is currently index 0, moving to position 1 above (2nd place) ie moving it "DOWN" the column
     */
    return {
      previousStageId: sortedStages[position - 1]?.stageId ?? NO_STAGE, // The old previous stage
      nextStageId: sortedStages[position]?.stageId ?? NO_STAGE, // We took this place and are now after it
    };
  }
  // Also dynamod doesn't allow undefined, hence the NO_STAGE
};
