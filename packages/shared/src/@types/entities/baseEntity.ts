import type { RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { IdPrefix } from "./idPrefix";

export type BaseEntity<T extends IdPrefix> = {
  _id: PlutomiId<T>;
  // This is the external name so it is easier to work with
  _type: T;
  // Timestamp / id, when working with transactions you can get a write lock on the item by updating this value
  _locked_at: string;
  created_at: Date;
  updated_at: Date;
  related_to: RelatedToArray<T>;
};
