import { Cascade, Collection, Entity, Index, OneToMany, Property } from '@mikro-orm/core';
import type { IndexedTargetArray } from '../types/main';
import { BaseEntity } from './BaseEntity';
import { UserLoginLink } from './UserLoginLink';

export type UserConstructorValues = Pick<User, 'firstName' | 'lastName' | 'target'>;

// TODO make login links an embedded document as a user will never have more than a handful with propert TTL
@Entity()
@Index({ name: 'target_array', options: { target: 1 } })
export class User extends BaseEntity {
  @OneToMany(() => UserLoginLink, (b) => b.user, { cascade: [Cascade.ALL] })
  loginLinks = new Collection<UserLoginLink>(this);

  @Property({ type: 'text', nullable: true })
  firstName?: string;

  @Property({ type: 'text', nullable: true })
  lastName?: string;

  @Property({ type: 'date', nullable: true })
  orgJoinDate?: Date;

  @Property({ type: 'bool' })
  emailVerified: boolean = false;

  @Property({ type: 'bool' })
  canReceiveEmails: boolean = true;

  @Property({ type: 'integer' })
  totalInvites: number = 0;

  @Property({ type: 'array' })
  target: IndexedTargetArray;

  constructor({ firstName, lastName, target }: UserConstructorValues) {
    super();
    this.firstName = firstName;
    this.lastName = lastName;
    this.target = target;
  }
}
