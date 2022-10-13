import { Collection, Entity, ManyToMany, OneToMany, OneToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity()
export class Org extends BaseEntity {
  @OneToMany(() => User, (User) => User.org)
  user = new Collection<User>(this);

  @OneToOne()
  createdBy: User;

  @Property({ columnType: 'text', nullable: false })
  orgId: string;

  @Property({ columnType: 'text', nullable: false })
  displayName: string;

  @Property({ columnType: 'integer', default: 0 })
  totalApplicants = 0;

  @Property({ columnType: 'integer', default: 0 })
  totalOpenings = 0;

  @Property({ columnType: 'integer', default: 1 })
  totalUsers = 1;

  @Property({ columnType: 'integer', default: 1 })
  totalWebhooks = 0;

  @Property({ columnType: 'integer', default: 1 })
  totalQuestions = 0;

  constructor(createdBy: User, orgId: string, displayName: string) {
    super();
    this.createdBy = createdBy;
    this.orgId = orgId;
    this.displayName = displayName;
  }
}
