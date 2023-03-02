import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';
import { StageTotals } from './totalsCount';

export interface StageEntity extends BaseEntity<AllEntityNames.Stage> {
  name: string;
  org: string;
  totals: StageTotals;
}
