import { AllEntityNames } from '.';
import { BaseEntity } from './baseEntity';

export type Application = BaseEntity<AllEntityNames.Application> & {
  name: string;
  org: string;
};
