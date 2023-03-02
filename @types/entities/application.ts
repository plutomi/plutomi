import { AllEntityNames } from '.';
import { BaseEntity } from './baseEntity';

export interface Application extends BaseEntity<AllEntityNames.Application> {
  name: string;
  org: string;
}
