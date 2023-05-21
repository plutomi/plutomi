import type { RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { AllEntityNames } from "./allEntityNames";

export type BaseEntity<T extends AllEntityNames> = {
  _id: PlutomiId<T>;
  createdAt: string;
  updatedAt: string;
  entityType: T;
  relatedTo: RelatedToArray<T>;
  // totals: Record<string, number>;
};
