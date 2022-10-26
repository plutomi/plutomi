import { IndexableProperties, IndexedTargetArrayItem } from '../types/indexableProperties';
import { BaseEntity } from './Base';

export interface UserTargetArray extends Omit<IndexedTargetArrayItem, 'property'> {
  property: Extends<keyof typeof IndexableProperties, 'Org' | 'Email' | 'Id'>;
}

export interface UserEntity extends BaseEntity {
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totalInvites: number;
  orgJoinDate?: Date;
  target: Array<UserTargetArray>;
}
