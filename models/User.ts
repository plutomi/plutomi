import { IndexableProperties, IndexedTargetArrayItem } from '../@types/indexableProperties';
import { BaseEntity } from './Base';
import { Extends } from '../@types/extends';
import { InviteEntity } from './Invites';

export type UserTargetArray = Array<
  Omit<IndexedTargetArrayItem, 'property'> & {
    property: Extends<keyof typeof IndexableProperties, 'Org' | 'Email'>;
  }
>;

export interface UserEntity extends BaseEntity {
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  canReceiveEmails: boolean;
  totalInvites: number;
  orgJoinDate?: Date;
  target: UserTargetArray;
  invites: InviteEntity[];
}
