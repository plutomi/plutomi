import { randColor, randAnimal, randProductAdjective } from "@ngneat/falso";

export const createRandomWorkspaceId = () =>
  [randColor(), randProductAdjective(), randAnimal()]
    .map((word) => word.toLowerCase())
    .join("-");
