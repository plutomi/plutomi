import type { RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { IdPrefix } from "./idPrefix";

export type BaseEntity<T extends IdPrefix> = {
  _id: PlutomiId<T>;
  createdAt: string;
  updatedAt: string;
  entityType: T;
  relatedTo: RelatedToArray<T>;
};
