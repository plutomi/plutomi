import { AllEntityNames } from '.';
import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { BaseEntity } from './baseEntity';

type Entity = AllEntityNames.Application;

type ApplicationTargetArray = IndexedTargetArray<Entity> &
  [
    // Get all applications for an org
    { id: PlutomiId<AllEntityNames.Org>; type: IndexableType.Org },
    // Get all applications for a workspace
    { id: PlutomiId<AllEntityNames.Workspace>; type: IndexableType.Workspace },
  ];

export type Application = BaseEntity<Entity> & {
  name: string;
  org: string;
  workspace: string;
  target: ApplicationTargetArray;
};
