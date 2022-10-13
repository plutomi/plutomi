import { Cascade, Collection, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { Org } from './Org';
import { UserLoginLink } from './UserLoginLink';

export type UserConstructorValues = Pick<User, 'firstName' | 'lastName' | 'email'>;

@Entity()
export class User extends BaseEntity {
  @Property({ type: 'text', nullable: true })
  firstName?: string;

  @Property({ type: 'text', nullable: true })
  lastName?: string;

  @Property({ type: 'text', unique: true, nullable: false })
  email: string;

  @ManyToOne(() => Org, { nullable: true })
  org?: Org;

  @Property({ type: 'date', nullable: true })
  orgJoinDate?: Date;

  @Property({ type: 'bool' })
  emailVerified: boolean = false;

  @Property({ type: 'bool' })
  canReceiveEmails: boolean = true;

  @Property({ type: 'integer' })
  totalInvites: number = 0;

  @OneToMany(() => UserLoginLink, (b) => b.user, { cascade: [Cascade.ALL] })
  loginLinks = new Collection<UserLoginLink>(this);

  constructor({ firstName, lastName, email }: UserConstructorValues) {
    super();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
}
