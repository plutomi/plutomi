import {
  Cascade,
  Collection,
  Entity,
  Enum,
  IdentifiedReference,
  ManyToOne,
  OneToMany,
  Property,
  Reference,
} from '@mikro-orm/core';
import { OpeningState } from '../Config';
import { IndexedTargetArray } from '../types/main';
import { BaseEntity } from './BaseEntity';
import { Org } from './Org';
import { Stage } from './Stage';

export type OpeningConstructorValues = Pick<Opening, 'name' | 'target'>;

@Entity()
export class Opening extends BaseEntity {
  @Property({ type: 'text', nullable: false })
  name: string;

  @Property({ type: 'integer' })
  totalApplicants: number = 0;

  @Property({ type: 'integer' })
  totalStages: number = 0;

  @Property({ type: 'array' })
  target: IndexedTargetArray;

  constructor({ name, target }: OpeningConstructorValues) {
    super();
    this.name = name;
    this.target = target;
  }
}
