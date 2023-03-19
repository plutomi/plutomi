import { PlutomiId } from '../../utils';
import { IndexableType, IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

type LoginLinkTotals = {};

type LoginLinkTargetArray = [
  ...IndexedTargetArray<AllEntityNames.LoginLink>,
  // Get all login links for an org
  { id: PlutomiId<AllEntityNames.Org>; type: IndexableType.LoginLink },
  // Get all login links for a workspace
  { id: PlutomiId<AllEntityNames.Workspace>; type: IndexableType.LoginLink },

  // Get all login links for a user
  { id: PlutomiId<AllEntityNames.User>; type: IndexableType.LoginLink },
];

export type LoginLink = BaseEntity<AllEntityNames.LoginLink> & {
  totals: LoginLinkTotals;
  expiresAt: string;
  target: LoginLinkTargetArray;
};
