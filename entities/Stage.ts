import {
  Entity,

  Index,
  Property,
} from '@mikro-orm/core';
import type { IndexedTargetArray } from '../types/main';
import { BaseEntity } from './BaseEntity';

export type StageConstructorValues = Pick<Stage, 'name' | 'target'>;

@Entity()
@Index({ name: 'target_array', options: { target: 1 } })
export class Stage extends BaseEntity {
  @Property({ type: 'text' })
  name: string;

  @Property({ type: 'integer' })
  totalApplicants: number = 0;

  @Property({ type: 'integer' })
  totalQuestions: number = 0;

  @Property({ type: 'array' })
  target: IndexedTargetArray;

  @Property({ type: 'array' }) // TODO replace with nextQuestionId and previousQuestionId
  questionOrder: string[] = [];

  constructor({ name, target }: StageConstructorValues) {
    super();
    this.name = name;
    this.target = target;
  }
}
