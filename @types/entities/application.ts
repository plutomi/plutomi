import { AllEntityNames } from '.';
import { BaseEntity } from './baseEntity';
import { EntityCount } from './entityCount';

export interface Application extends BaseEntity<AllEntityNames.Application> {
  name: string;
  orgId: string;
  // count: Pick<EntityCount, 'applicants' | 'stages'>;
}
