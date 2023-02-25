import { BaseEntity } from './baseEntity';

/**
 * Counts of entities in an org
 */
interface OrgTotals {
  applicants: number;
  users: number;
  applications: number;
  stages: number;
  webhooks: number;
  questions: number;
}

export interface Org extends BaseEntity<AllEntityNames.Org> {
  displayName: string;
  totals: OrgTotals;
}
