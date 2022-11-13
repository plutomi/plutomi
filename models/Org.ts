import { BaseEntity } from './Base';

export type OrgTargetArray = [];

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
