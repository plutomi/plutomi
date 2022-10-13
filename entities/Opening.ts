import { Cascade, Collection, Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { OpeningState } from '../Config';
import { BaseEntity } from './BaseEntity';
import { Org } from './Org';

export type OpeningConstructorValues = Pick<Opening, 'name' | 'state'>;

@Entity()
export class Opening extends BaseEntity {
  @Property({ type: 'text', nullable: false })
  name: string;

  @ManyToOne(() => Org)
  org: Org;

  @Enum({ items: () => OpeningState, default: OpeningState.PRIVATE })
  state: OpeningState = OpeningState.PRIVATE;

  @Property({ type: 'integer', default: 0 })
  totalApplicants!: number;

  @Property({ type: 'integer', default: 0 })
  totalStages!: number;

  // TODO stages

  //   @OneToMany(() => UserLoginLink, (b) => b.user, { cascade: [Cascade.ALL] })
  //   loginLinks = new Collection<UserLoginLink>(this);

  //   @OneToMany(() => UserLoginLink, (b) => b.user, { cascade: [Cascade.ALL] })
  //   loginLinks = new Collection<UserLoginLink>(this);

  constructor({ name, state }: OpeningConstructorValues) {
    super();
    this.name = name;
    this.state = state;
  }
}
