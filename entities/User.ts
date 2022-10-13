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

  @Property({ type: 'bool', default: false })
  emailVerified!: number;

  @Property({ type: 'bool', default: true })
  canReceiveEmails!: number;

  @Property({ type: 'integer', default: 0 })
  totalInvites!: number;

  @OneToMany(() => UserLoginLink, (b) => b.user, { cascade: [Cascade.ALL] })
  loginLinks = new Collection<UserLoginLink>(this);

  constructor({ firstName, lastName, email }: UserConstructorValues) {
    super();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
}
