import { AllEntityNames } from '../utils';

// Note: These are properties inside of the above top level entities
export enum IndexableProperties {
  Entity = 'Entity',
  User = 'User',
  Id = 'Id',
  Email = 'Email',
  OpeningState = 'OpeningState',
  NextStage = 'NextStage',
  PreviousStage = 'PreviousStage',
  NextQuestion = 'NextQuestion',
  PreviousQuestion = 'PreviousQuestion',
}

export interface EntityTargetArrayItem {
  id: AllEntityNames;
  type: IndexableProperties.Entity;
}

export interface IdTargetArrayItem {
  id: string;
  /**
   * Raw prefixed ID
   */
  type: IndexableProperties.Id;
}

export interface IndexedTargetArrayItem {
  id: string | null;
  type: IndexableProperties | AllEntityNames;
}

/**
 * Must include two objects:
 * 1. The entity type of the item
 * 2. The raw ID of the item (prefix_ksuid)
 */
export type IndexedTargetArray = [
  EntityTargetArrayItem,
  IdTargetArrayItem,
  /**
   *
   * ! NOTE: The _id field is typically NOT the primary access pattern. Read on!
   *
   * The top level `_id` prefix satisfies hierarchical access patterns whenever possible on items that are children of other items.
   * Top level items include items that have <= 1 parent such as a User (no parent), an Org (no parent),
   * an Application (Org is the parent, 1 parent), or an Applicant (Org is the parent, 1 parent).
   * These items will have _id's like { _id: org_plutomi#entity_N3d18s }
   * 
   * Items that *are not* top level items could be:
   * 
   * ~ Stages: Belong to an Application (parent 1) and the Application belongs to an Org (parent 2). 
   * A stage would have an ID like { _id: org_plutomi#appl_bh7x1#stg_kg9dn4 } <-- Note the key overloading!
   * 
   * ~ Webhook History: The history for a webhook belongs to that webhook (parent 1) but that webhook belongs to an org (parent 2)
   * Webhook history would have an ID like: { _id: org_plutomi#wbhk_t2bVc9#wbhkhis_8ru2Wq } <-- Note the key overloading!
   * 
   *  Let's take a look at an example with `Applications`, `Stages`, and `Applicants` in those stages.
   *
   * For the org `plutomi`, we have an application of `NYC Driver (appl_bh7x1)` with the stage of `Interview` (stg_kg9dn4) 
   * 
   * The _id of the stage will look like this:
   *

   *
   * This allows the following access patterns:
   * 1. Everything related to the Plutomi org using /^org_plutomi/
   * 2. All applications in the Plutomi org using /^org_plutomi#appl_/ &  (target.id = Opening
   * 3. The NYC Driver application (/application/:id) using the full value org_plutomi#appl_bh7x1#stg_kg9dn4
   * 3. Everything related to the NYC Driver application using /^org_plutomi#appl_bh7x1/
   * 4. All stages related  to the NYC Driver application using /^org_plutomi#appl_bh7x1#stg_/
   *  - Along with any other sub items that might come later by simply changing the prefix
   * 5. Everything related to the Interview stage in the NYC Driver application using /^org_plutomi#appl_bh7x1#stg_kg9dn4/
   *
   * The target array is typically for other entities that this item is related to...
   * 
   * 
   * For example a stage and an application.
   * Do note that the id value in the target array is the `_id` value of that entity, this allows for $lookups if need be.
   *
   * { target: [ { id: org_plutomi#NYC, type: Application }]}
   * 
   * 
   * 
   * 
   *   //  * And we can have other sub categories like `rules` in the future by appending their IDs if needed.
  //  *
  //  * { _id: org_plutomi#stg_interview#stgrul_n9dh193 } @ /stage/:id/rules/:id
   */
  ...IndexedTargetArrayItem[],
];
