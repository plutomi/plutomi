// import { Entity, Index, Property } from '@mikro-orm/core';
// import type { IndexedTargetArray, IdxTypes } from '../types/main';
// import { BaseEntity } from './BaseEntity';
// import { OpeningState } from '../Config';

// export type OpeningConstructorValues = Pick<Opening, 'name' | 'target'>;

// @Entity()
// @Index({ name: 'target_array', options: { target: 1 } })
// export class Opening extends BaseEntity {
//   @Property({ type: 'text', nullable: false })
//   name: string;

//   @Property({ type: 'integer' })
//   totalApplicants: number = 0;

//   @Property({ type: 'integer' })
//   totalStages: number = 0;

//   /**
//    * Indexed target array for the opening. Indexed properties are:
//    *
//    * {@link OpeningState} - You can make Openings {@link OpeningState.Public} or {@link OpeningState.Private}
//    *
//    *  Org - @string - ID of the org this opening belongs to. Type of {@link IdxTypes.Org}
//    */
//   @Property({ type: 'array' })
//   target: IndexedTargetArray;

//   constructor({ name, target }: OpeningConstructorValues) {
//     super();
//     this.name = name;
//     this.target = target;
//   }
// }

export const a = '';
