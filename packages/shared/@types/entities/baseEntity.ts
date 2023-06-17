import type { RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { IdPrefix } from "./idPrefix";

export type BaseEntity<T extends IdPrefix> = {
  _id: PlutomiId<T>;
  // This is the external name so it is easier to work with
  _type: T;
  createdAt: Date;
  updatedAt: Date;
  relatedTo: RelatedToArray<T>;
};
