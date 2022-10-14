import { Entity, IdentifiedReference, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import dayjs from 'dayjs';

export type UserLoginLinkConstructorValues = Pick<UserLoginLink, 'user'>;

@Entity()
export class UserLoginLink extends BaseEntity {
  @ManyToOne(() => User) // TODO  wrapped reference?
  user: User; // TODO make this an index target array

  // TODO: Add mongodb TTL
  @Property({ type: 'date' })
  ttlExpiry: Date = dayjs().add(15, 'minutes').toDate(); // How long login links are valid for

  constructor({ user }: UserLoginLinkConstructorValues) {
    super();
    this.user = user;
  }
}
