import { AllEntityNames } from '.';
import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { BaseEntity } from './baseEntity';

type Entity = AllEntityNames.Application;

type ApplicationTargetArray = IndexedTargetArray<Entity> &
  // All applications for an org
  [{ id: PlutomiId<AllEntityNames.Org>; type: IndexableType.Org }];

export type Application = BaseEntity<Entity> & {
  name: string;
  org: string;
  target: ApplicationTargetArray;
};
