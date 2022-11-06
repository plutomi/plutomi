import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';
import { Extends } from '../@types/extends';

export type UserLoginLinkTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: Extends<keyof typeof IndexableProperties, 'User'>;
  }
>;

export interface UserLoginLinkEntity extends BaseEntity {
  target: UserLoginLinkTargetArray;
}
