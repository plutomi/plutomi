import {
  UserEntity,
  UserLoginLinkEntity,
  UserLoginLinkTargetArray,
  UserTargetArray,
} from '../models';
import {
  IndexableProperties,
  IndexedTargetArray,
  IndexedTargetArrayItem,
} from '../@types/indexableProperties';

/**
 * Finds a value in a {@link IndexedTargetArray}
 */
export const findInTargetArray = (
  property: IndexableProperties,
  entity: UserEntity | UserLoginLinkEntity,
): string | undefined =>
  // @ts-ignore TODO!!!!!!
  entity.target.find((item: IndexedTargetArrayItem) => item.property === property)?.value;
