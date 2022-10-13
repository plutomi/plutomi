import { Cascade, Collection, Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { OpeningState } from '../Config';
import { BaseEntity } from './BaseEntity';
import { Org } from './Org';
import { Stage } from './Stage';

export type OpeningConstructorValues = Pick<Opening, 'name' | 'state' | 'org'>;

@Entity()
export class Opening extends BaseEntity {
  @Property({ type: 'text', nullable: false })
  name: string;

  @ManyToOne(() => Org)
  org: Org;

  // TODO allow creating public openings through the API
  @Enum({ items: () => OpeningState, default: OpeningState.PRIVATE })
  state!: OpeningState;

  @Property({ type: 'integer', default: 0 })
  totalApplicants!: number;

  @Property({ type: 'integer', default: 0 })
  totalStages!: number;

  @OneToMany(() => Stage, (b) => b.opening, { cascade: [Cascade.ALL] })
  stages = new Collection<Stage>(this);

  constructor({ name, state, org }: OpeningConstructorValues) {
    super();
    this.name = name;
    this.state = state;
    this.org = org;
  }
}
