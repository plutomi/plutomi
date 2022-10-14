import { Entity, Property, Reference } from '@mikro-orm/core';
import { IndexedTargetArray } from '../types/main';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

export type OrgConstructorValues = Pick<Org, 'orgId' | 'displayName' | 'target'>;

@Entity()
export class Org extends BaseEntity {
  @Property({ type: 'text', unique: true })
  orgId: string;

  @Property({ type: 'text' })
  displayName: string;

  @Property({ type: 'integer', default: 0 })
  totalApplicants!: number;

  @Property({ type: 'integer', default: 0 })
  totalOpenings!: number;

  @Property({ type: 'integer', default: 1 })
  totalUsers!: number;

  @Property({ type: 'integer', default: 0 })
  totalWebhooks!: number;

  @Property({ type: 'integer', default: 0 })
  totalQuestions!: number;

  @Property({ type: 'array' })
  target: IndexedTargetArray;

  constructor({ orgId, displayName, target }: OrgConstructorValues) {
    super();
    this.orgId = orgId;
    this.displayName = displayName;
    this.target = target;
  }
}
