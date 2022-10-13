import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import dayjs from 'dayjs';

@Entity()
export class UserLoginLink extends BaseEntity {
  @ManyToOne(() => User)
  user: User;

  // TODO: Add mongodb TTL
  @Property({ columnType: 'date' })
  ttlExpiry = dayjs().add(15, 'minutes').toDate();

  constructor(user: User) {
    super();
    this.user = user;
  }
}
