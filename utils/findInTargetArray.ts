import {
  InviteEntity,
  OrgEntity,
  StageEntity,
  StageQuestionItemEntity,
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
  entity:
    | UserEntity
    | UserLoginLinkEntity
    | OrgEntity
    | OpeningEntity
    | StageEntity
    | InviteEntity
    | StageQuestionItemEntity,
): string | undefined =>
  // @ts-ignore TODO!!!!!!
  entity.target.find((item: IndexedTargetArrayItem) => item.property === property)?.value;
