import { PlutomiId } from '../../utils';
import { IndexedTargetArray } from '../indexableProperties';
import { AllEntityNames } from './allEntityNames';
import { BaseEntity } from './baseEntity';
import { OrgTotals } from './totalsCount';

type Entity = AllEntityNames.Org;

type OrgTargetArray = IndexedTargetArray<Entity>;

export type Org = BaseEntity<Entity> & {
  displayName: string;
  totals: OrgTotals;
  target: OrgTargetArray;
};
