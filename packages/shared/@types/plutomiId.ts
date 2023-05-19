import type { AllEntityNames } from "./entities";

export type PlutomiId<T extends AllEntityNames> = `${T}_${string}`;
