import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';
import { Extends } from '../@types/extends';

export type OrgTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: Extends<keyof typeof IndexableProperties, 'Id'>;
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
  target: OrgTargetArray;
}