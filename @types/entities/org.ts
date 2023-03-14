import { PlutomiId } from '../../utils';
import { IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';

/**
 * These totals are for an org, across all workspaces!
 */
export type OrgTotals = {
  applicants: number;
  applications: number;
  users: number;
  invites: number;
  memberships: number; // Should be identical to memberships
  stages: number;
  webhooks: number;
  questions: number;
  workspaces: number;
};

type Entity = AllEntityNames.Org;

type OrgTargetArray = IndexedTargetArray<Entity>;

export type Org = BaseEntity<Entity> & {
  displayName: string;
  totals: OrgTotals;
  target: OrgTargetArray;
};
