import { IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';

export type OrgTargetArray = Array<IndexedTargetArrayItem>;

export interface OrgEntity extends BaseEntity {
  displayName: string;
  totalApplicants: number;
  totalUsers: number;
  totalOpenings: number;
  totalStages: number;
  totalWebhooks: number;
  totalQuestions: number;
  target: OrgTargetArray;
}
