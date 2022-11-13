import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';

export type OrgTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: keyof typeof IndexableProperties;
  }
>;

export interface OrgEntity extends BaseEntity {
  displayName: string;
  totalApplicants: number;
  totalUsers: number;
  totalOpenings: number;
  totalStages: number;
  totalWebhooks: number;
  totalQuestions: number;
  createdBy: string;
  target: OrgTargetArray;
}
