import type { IndexedTargetArray } from "../indexableProperties";
import type { AllEntityNames } from "./allEntityNames";
import type { BaseEntity } from "./baseEntity";

/**
 * These totals are for an org, across all workspaces!
 */
export type OrgTotals = {
  applicants: number;
  applications: number;
  users: number;
  invites: number;
  memberships: number;
  stages: number;
  webhooks: number;
  questions: number;
  workspaces: number;
};

type OrgTargetArray = IndexedTargetArray<AllEntityNames.Org>;

export type Org = BaseEntity<AllEntityNames.Org> & {
  displayName: string;
  totals: OrgTotals;
  target: OrgTargetArray;
};
