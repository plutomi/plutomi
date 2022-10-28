import { IndexableProperties } from '../@types/indexableProperties';
import { StageEntity } from '../models';
import { findInTargetArray } from './findInTargetArray';

interface GetAdjacentStagesBasedOnPositionProps {
  position?: number;

  /**
   * This must be a *SORTED* list of the other stages
   */
  otherSortedStages: StageEntity[];
  stageIdBeingMoved: string;
}
interface AdjacentStagesResult {
  newNextStageId: string | undefined;
  newPreviousStageId: string | undefined;
}

export const sortStages = (unsortedStagesInOpening: StageEntity[]): StageEntity[] => {
  // No need to sort on these conditions
  if (!unsortedStagesInOpening.length) return [];
  if (unsortedStagesInOpening.length === 1) return unsortedStagesInOpening;

  let firstStage: StageEntity;
  let firstStageIndex: number;

  console.log(unsortedStagesInOpening);
  unsortedStagesInOpening.find((stage, idx) => {
    const previousStage = findInTargetArray(IndexableProperties.PreviousStage, stage);

    if (!previousStage) {
      firstStage = stage;
      firstStageIndex = idx;
    }
  });

  const sortedStages: StageEntity[] = [];
  sortedStages.push(firstStage);

  // Remove the first stage from the unsorted list, it is no longer needed
  unsortedStagesInOpening.splice(firstStageIndex, 1);

  // Push all but the first stage into an object so we can get *almost* O(1) queries
  const mapWithStages: Record<string, StageEntity> = {};
  unsortedStagesInOpening.map((stage) => {
    const stageId = findInTargetArray(IndexableProperties.Id, stage);
    mapWithStages[stageId] = stage;
  });

  let reachedTheEnd = false;
  let startingStage = firstStage;

  while (!reachedTheEnd) {
    console.log('IN while loop');
    const newNextStageId = findInTargetArray(IndexableProperties.NextStage, startingStage);

    let nextStage: StageEntity | undefined;

    if (newNextStageId) {
      nextStage = mapWithStages[newNextStageId.toString()];
      sortedStages.push(nextStage);
      startingStage = nextStage;
      // Continue loop until all stages are sorted
    } else {
      reachedTheEnd = true;
      break;
    }
  }

  return sortedStages;
};

export const getAdjacentStagesBasedOnPosition = ({
  position,
  otherSortedStages,
  stageIdBeingMoved,
}: GetAdjacentStagesBasedOnPositionProps): AdjacentStagesResult => {
  if (!position && position !== 0) {
    // Position not provided, add it to the end
    const stage = otherSortedStages[otherSortedStages.length - 1];
    const stageId = stage ? findInTargetArray(IndexableProperties.Id, stage) : undefined;

    return {
      newNextStageId: undefined,
      newPreviousStageId: stageId,
    };
  }

  if (position === 0) {
    // Stage wants to be first
    const stage = otherSortedStages[0];
    const stageId = stage ? findInTargetArray(IndexableProperties.Id, stage) : undefined;
    return {
      newPreviousStageId: undefined,
      newNextStageId: stageId,
    };
  }

  /**
   * ! Note: We are not allowing stage updates if the stage is dropped in the same position as it's redundant.
   * if (currentIndex === position)
   */
  const currentIndex = otherSortedStages.findIndex((stage) => {
    const stageId = findInTargetArray(IndexableProperties.Id, stage);
    stageId === stageIdBeingMoved;
  });

  /**
   * We have to check if we are moving the stage:
   *
   * * DOWN *
   *
   * OLD --- NEW
   *
   * Stage 1 --- Stage 2
   * Stage 2 --- Stage 3
   * Stage 3 --- Stage 1 <-- Moved
   *
   *
   *  or...
   */

  if (position > currentIndex) {
    const newPreviousStage = otherSortedStages[position];
    const newNextStage = otherSortedStages[position + 1];

    const newPreviousStageId = newPreviousStage
      ? findInTargetArray(IndexableProperties.Id, newPreviousStage)
      : undefined;

    const newNextStageId = newNextStage
      ? findInTargetArray(IndexableProperties.Id, newNextStage)
      : undefined;

    return {
      newPreviousStageId,
      newNextStageId,
    };
  }

  /**
   *  * UP *
   *
   * OLD --- NEW
   *
   * Stage 1 --- Stage 3 <-- Moved
   * Stage 2 --- Stage 2
   * Stage 3 --- Stage 1
   */
  if (position < currentIndex) {
    const newPreviousStage = otherSortedStages[position - 1];
    const newNextStage = otherSortedStages[position];

    const newPreviousStageId = newPreviousStage
      ? findInTargetArray(IndexableProperties.Id, newPreviousStage)
      : undefined;

    const newNextStageId = newNextStage
      ? findInTargetArray(IndexableProperties.Id, newNextStage)
      : undefined;

    return {
      newPreviousStageId,
      newNextStageId,
    };
  }
};
