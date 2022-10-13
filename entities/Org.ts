import { Collection, Entity, OneToMany, OneToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

export type OrgConstructorValues = Pick<Org, 'createdBy' | 'orgId' | 'displayName'>;

@Entity()
export class Org extends BaseEntity {
  @OneToMany(() => User, (User) => User.org)
  user = new Collection<User>(this);

  @OneToOne(() => User)
  createdBy: User;

  @Property({ type: 'text', nullable: false })
  orgId: string;

  @Property({ type: 'text', nullable: false })
  displayName: string;

  @Property({ type: 'integer', default: 0 })
  totalApplicants!: number;

  @Property({ type: 'integer', default: 0 })
  totalOpenings!: number;

  @Property({ type: 'integer', default: 1 })
  totalUsers!: number;

  @Property({ type: 'integer', default: 1 })
  totalWebhooks!: number;

  @Property({ type: 'integer', default: 1 })
  totalQuestions!: number;

  constructor({ orgId, createdBy, displayName }: OrgConstructorValues) {
    super();
    this.createdBy = createdBy;
    this.orgId = orgId;
    this.displayName = displayName;
  }
}
