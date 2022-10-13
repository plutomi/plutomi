import {
  Cascade,
  Collection,
  Entity,
  Enum,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { OpeningState } from '../Config';
import { BaseEntity } from './BaseEntity';
import { Org } from './Org';
import { Stage } from './Stage';

export type OpeningConstructorValues = Pick<Opening, 'name' |  'org'>;

@Entity()
export class Opening extends BaseEntity {
  @Property({ type: 'text', nullable: false })
  name: string;

  @ManyToOne(() => Org, { wrappedReference: true })
  org: IdentifiedReference<Org>;

  // TODO allow creating public openings through the API
  @Enum({ items: () => OpeningState })
  state: OpeningState = OpeningState.PRIVATE;

  @Property({ type: 'integer' })
  totalApplicants: number = 0;

  @Property({ type: 'integer' })
  totalStages: number = 0;

  @OneToMany(() => Stage, (b) => b.opening, { cascade: [Cascade.ALL] })
  stages = new Collection<Stage>(this);

  constructor({ name, org }: OpeningConstructorValues) {
    super();
    this.name = name;
    this.org = org;
  }
}
