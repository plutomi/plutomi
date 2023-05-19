import type { IndexedTargetArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { AllEntityNames } from "./allEntityNames";

export type BaseEntity<T extends AllEntityNames> = {
  _id: PlutomiId<T>;
  createdAt: Date;
  updatedAt: Date;
  entityType: T;
  target: IndexedTargetArray<T>;
  totals: Record<string, number>;
};
