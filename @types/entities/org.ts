import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';
import { OrgTotals } from './totalsCount';

export interface Org extends BaseEntity<AllEntityNames.Org> {
  displayName: string;
  totals: OrgTotals;
}
