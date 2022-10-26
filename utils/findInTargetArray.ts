import { AllEntities } from '../types/allEntities';
import { IndexableProperties, IndexedTargetArray } from '../types/indexableProperties';

/**
 * Finds a value in a {@link IndexedTargetArray}
 */
export const findInTargetArray = (
  entity: AllEntities,
  property: IndexableProperties,
): string | undefined => entity.target.find((item) => item.property === property)?.value;
