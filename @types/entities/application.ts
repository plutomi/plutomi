import { AllEntityNames } from '.';
import { BaseEntity } from './baseEntity';

export interface Application extends BaseEntity<AllEntityNames.Application> {
  name: string;
  orgId: string;
  // count: Pick<EntityCount, 'applicants' | 'stages'>;
}
