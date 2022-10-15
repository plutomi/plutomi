import { Entity, Index, Property } from '@mikro-orm/core';
import type { IndexedTargetArray } from '../types/main';
import { BaseEntity } from './BaseEntity';

export type OpeningConstructorValues = Pick<Opening, 'name' | 'target'>;

@Entity()
@Index({ name: 'target_array', options: { target: 1 } })
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
