import { IndexableProperties } from '../@types/indexableProperties';
import { BaseEntity } from './Base';
import { OpeningState } from '../Config';

export type OpeningTargetArray = [
  { property: IndexableProperties.OpeningState; value: OpeningState },
];

export interface OpeningEntity extends BaseEntity {
  name: string;
  orgId: string; // Compound index with Id
  totalApplicants: number;
  totalStages: number;
  target: OpeningTargetArray;
}
