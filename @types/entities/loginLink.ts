import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

type LoginLinkTotals = {};

type Entity = AllEntityNames.LoginLink;

type LoginLinkTargetArray = IndexedTargetArray<Entity> &
  [
    // Get all login links for an org
    { id: PlutomiId<AllEntityNames.Org>; type: IndexableType.LoginLink },
    // Get all login links for a workspace
    { id: PlutomiId<AllEntityNames.Workspace>; type: IndexableType.LoginLink },

    // Get all login links for a user
    { id: PlutomiId<AllEntityNames.User>; type: IndexableType.LoginLink },
  ];

export type LoginLink = BaseEntity<Entity> & {
  totals: LoginLinkTotals;
  target: LoginLinkTargetArray;
};
