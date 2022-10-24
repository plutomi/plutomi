import { Entity, Index, Property } from '@mikro-orm/core';
import type { IndexedTargetArray } from '../types/main';
import { BaseEntity } from './BaseEntity';
import { User } from '../entities';
export type OrgConstructorValues = Pick<Org, 'orgId' | 'displayName' | 'target'>;

@Entity()
@Index({ name: 'target_array', options: { target: 1 } })
export class Org extends BaseEntity {
  @Property({ type: 'text', unique: true })
  orgId: string; // TODO move this to target array

  @Property({ type: 'text' })
  displayName: string;

  @Property({ type: 'integer' })
  totalApplicants: number = 0;

  @Property({ type: 'integer' })
  totalOpenings: number = 0;

  @Property({ type: 'integer' })
  totalUsers: number = 1;

  @Property({ type: 'integer' })
  totalWebhooks: number = 0;

  @Property({ type: 'integer' })
  totalQuestions: number = 0;

  /**
   * Indexed target array for the Org. Indexed properties are:
   *
   *  CreatedBy - @string - ID of the {@link User} that created this org
   */

  @Property({ type: 'array' })
  target: IndexedTargetArray;

  constructor({ orgId, displayName, target }: OrgConstructorValues) {
    super();
    this.orgId = orgId;
    this.displayName = displayName;
    this.target = target;
  }
}
