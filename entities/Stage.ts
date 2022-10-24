import { Entity, Index, Property } from '@mikro-orm/core';
import type { IndexedTargetArray, IndexedEntities } from '../types/main';
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

  @Property({ type: 'array' }) // TODO replace with nextQuestionId and previousQuestionId
  questionOrder: string[] = [];

  /**
   * Indexed target array for the stage. Indexed properties are:
   *
   *  NextStage - @string - If it exists, it's the ID of the stage that comes *after* this stage.  Type of {@link IndexedEntities.NextStage}
   *
   *  PreviousStage - @string  - If it exists, it's the ID of the stage that comes *before* this stage.  Type of {@link IndexedEntities.PreviousStage}
   *
   *  Org - @string - ID of the org this stage belongs to.  {@link IndexedEntities.Org}
   *
   *  Opening - @string - ID of the opening this stage belongs to. Type of {@link IndexedEntities.Opening}
   */
  @Property({ type: 'array' })
  target: IndexedTargetArray;

  constructor({ name, target }: StageConstructorValues) {
    super();
    this.name = name;
    this.target = target;
  }
}
