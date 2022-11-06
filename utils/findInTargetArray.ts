import {
  InviteEntity,
  OrgEntity,
  StageEntity,
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
import { OpeningEntity } from '../models/Opening';

/**
 * Finds a value in a {@link IndexedTargetArray}
 */
export const findInTargetArray = (
  property: IndexableProperties,
  entity: UserEntity | UserLoginLinkEntity | OrgEntity | OpeningEntity | StageEntity | InviteEntity,
): string | undefined =>
  // @ts-ignore TODO!!!!!!
  entity.target.find((item: IndexedTargetArrayItem) => item.property === property)?.value;
