import type { IndexedTargetArray, IndexedEntities, IndexIdTypes } from '../types/main';

interface FindInTargetArrayProps {
  entity: IndexedEntities;
  targetArray: IndexedTargetArray;
}

/**
 * Finds a value (id) in a {@link IndexedTargetArray}
 *
 * @returns string - ID of the entity
 */
export const findInTargetArray = ({ entity, targetArray }: FindInTargetArrayProps): IndexIdTypes =>
  targetArray.find((item) => item.type === entity)?.id;
