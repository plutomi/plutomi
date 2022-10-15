import { ObjectId } from '@mikro-orm/mongodb';
import { Stage } from '../entities';
import { IndexedEntities } from '../types/main';
import { findInTargetArray } from './findInTargetArray';

interface GetAdjacentStagesBasedOnPositionProps {
  position?: number;

  /**
   * This must be a *SORTED* list of the other stages
   */
  otherSortedStages: Stage[];
  stageIdBeingMoved: string;
}
interface AdjacentStagesResult {
  newNextStageId: string | undefined;
  newPreviousStageId: string | undefined;
}

export const sortStages = (unsortedStagesInOpening: Stage[]): Stage[] => {
  // No need to sort on these conditions
  if (!unsortedStagesInOpening.length) return [];
  if (unsortedStagesInOpening.length === 1) return unsortedStagesInOpening;

  let firstStage: Stage;
  let firstStageIndex: number;

  unsortedStagesInOpening.find((stage, idx) => {
    const previousStage = findInTargetArray({
      entity: IndexedEntities.PreviousStage,
      targetArray: stage.target,
    });

    if (previousStage) {
      firstStage = stage;
      firstStageIndex = idx;
    }
  });

  const sortedStages: Stage[] = [];
  sortedStages.push(firstStage);

  // Remove the first stage from the unsorted list, it is no longer needed
  unsortedStagesInOpening.splice(firstStageIndex, 1);

  // Push all but the first stage into an object so we can get *almost* O(1) queries
  const mapWithStages: Record<string, Stage> = {};
  unsortedStagesInOpening.map((stage) => {
    mapWithStages[stage.id] = stage;
  });

  let reachedTheEnd = false;
  let startingStage = firstStage;

  while (!reachedTheEnd) {
    const newNextStageId = findInTargetArray({
      entity: IndexedEntities.NextStage,
      targetArray: startingStage.target,
    });

    let nextStage: Stage;
    if (newNextStageId) {
      const nextStage = mapWithStages[newNextStageId.toString()];
      sortedStages.push(nextStage);
      startingStage = nextStage;
    } else {
      reachedTheEnd = true;
      break;
    }

    // Check if the next stage has it's own next stage
    const nextStageHasANextStage = findInTargetArray({
      entity: IndexedEntities.NextStage,
      targetArray: nextStage.target,
    });
    if (nextStageHasANextStage) {
      reachedTheEnd = true;
    }

    // Continue loop until all stages are sorted
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
    return {
      newNextStageId: undefined,
      newPreviousStageId: otherSortedStages[otherSortedStages.length - 1]?.id,
    };
  }

  if (position === 0) {
    // First in the list, get the current first stage
    return {
      newPreviousStageId: undefined,
      newNextStageId: otherSortedStages[0]?.id,
    };
  }

  // We didn't really move it anywhere this shouldn't be possible // TODO add it here
  // const currentIndex = otherSortedStages.findIndex((item) => item.id === stageIdBeingMoved);
  //   if (currentIndex === position) {

  //   }

  const currentIndex = otherSortedStages.findIndex((item) => item.id === stageIdBeingMoved);

  /**
   * We have to check if we are moving the stage:
   *
   * 1. DOWN
   *
   * OLD --- NEW
   *
   * Stage 1 --- Stage 2
   * Stage 2 --- Stage 3
   * Stage 3 --- Stage 1 <-- Moved
   *
   *
   * 2. UOR
   *
   * OLD --- NEW
   *
   * Stage 1 --- Stage 3 <-- Moved
   * Stage 2 --- Stage 2
   * Stage 3 --- Stage 1
   */

  // If we moved it down
  if (position > currentIndex) {
    return {
      newPreviousStageId: otherSortedStages[position]?.id,
      newNextStageId: otherSortedStages[position + 1]?.id,
    };
  }

  // If we moved it up
  if (position < currentIndex) {
    return {
      newPreviousStageId: otherSortedStages[position - 1]?.id,
      newNextStageId: otherSortedStages[position]?.id,
    };
  }

  // No same place movement should be
  throw new Error(`Uncaught index movement!!!!!!!!!!! ${position} - ${currentIndex} `);
};
