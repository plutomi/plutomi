import { Cascade, Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { UserLoginLink } from './UserLoginLink';

@Entity()
export class User extends BaseEntity {
  @Property({ columnType: 'text', nullable: true })
  firstName: string;

  @Property({ columnType: 'text', nullable: true })
  lastName: string;

  @Property({ columnType: 'text', unique: true, nullable: false })
  email: string;

  //   @OneToMany({})
  //   org: 'asd', // TODO

  @Property({ columnType: 'date', nullable: true })
  orgJoinDate: Date;

  @Property({ columnType: 'bool', default: false })
  emailVerified: boolean;

  @Property({ columnType: 'bool', default: true })
  canReceiveEmails: boolean;

  @Property({ columnType: 'integer', default: 0 })
  totalInvites: number;

  @OneToMany(() => UserLoginLink, (b) => b.user, { cascade: [Cascade.ALL] })
  loginLinks = new Collection<UserLoginLink>(this);

  constructor(firstName: string, lastName: string, email: string) {
    super();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
}
