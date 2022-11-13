import { BaseEntity } from './Base';

export interface UserLoginLinkEntity extends Omit<BaseEntity, 'orgId'> {
  userId: string; // Compound index with Id
  target: [];
}
