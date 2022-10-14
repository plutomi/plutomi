import { Stage } from '../entities';
import { IndexedEntities } from '../types/main';
import { findInTargetArray } from './findInTargetArray';

interface GetAdjacentStagesBasedOnPositionProps {
  position?: number;
  otherStages: Stage[];
  stageIdWeAreMoving: string;
}
interface AdjacentStagesResult {
  nextStageId?: string;
  previousStageId?: string;
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
};
