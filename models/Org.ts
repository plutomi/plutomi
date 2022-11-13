import { Extends } from '../@types/extends';
import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';

export type OrgTargetArray = [{ property: IndexableProperties.CreatedBy; value: string }];

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
