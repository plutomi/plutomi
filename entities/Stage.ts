import { Entity, Enum, IdentifiedReference, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { Opening } from './Opening';
import { Org } from './Org';

export type StageConstructorValues = Pick<Stage, 'name' | 'org'>;

@Entity()
export class Stage extends BaseEntity {
  @Property({ type: 'text' })
  name: string;

  @ManyToOne(() => Org, { wrappedReference: true })
  org: IdentifiedReference<Org>;

  @ManyToOne(() => Opening)
  opening: Opening;

  @Property({ type: 'integer' })
  totalApplicants: number = 0;

  @Property({ type: 'integer' })
  totalQuestions: number = 0;

  // TODO questions

  // @OneToMany(() => UserLoginLink, (b) => b.user, { cascade: [Cascade.ALL] })
  // loginLinks = new Collection<UserLoginLink>(this);

  constructor({ name, org }: StageConstructorValues) {
    super();
    this.name = name;
    this.org = org;
  }
}
