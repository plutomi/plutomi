import type { IdPrefix } from "./entities";

export type PlutomiId<T extends IdPrefix> = `${T}_${string}`;
