import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { Opening } from './Opening';
import { Org } from './Org';

export type StageConstructorValues = Pick<Stage, 'name' | 'org'>;

@Entity()
export class Stage extends BaseEntity {
  @Property({ type: 'text', nullable: false })
  name: string;

  @ManyToOne(() => Org)
  org: Org;

  @ManyToOne(() => Opening)
  opening: Opening;

  @Property({ type: 'integer', default: 0 })
  totalApplicants!: number;

  @Property({ type: 'integer', default: 0 })
  totalQuestions!: number;

  // TODO questions

  // @OneToMany(() => UserLoginLink, (b) => b.user, { cascade: [Cascade.ALL] })
  // loginLinks = new Collection<UserLoginLink>(this);

  constructor({ name, org }: StageConstructorValues) {
    super();
    this.name = name;
    this.org = org;
  }
}
