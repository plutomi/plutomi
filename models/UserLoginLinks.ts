import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';

export type UserLoginLinkTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: keyof typeof IndexableProperties;
  }
>;

export interface UserLoginLinkEntity extends Omit<BaseEntity, 'orgId'> {
  userId: string; // Compound index with Id
  target: UserLoginLinkTargetArray;
}
