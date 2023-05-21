// import type { AllEntityNames } from "./allEntityNames";
// import type { RelatedToType, RelatedToArray } from "../indexableProperties";
// import type { BaseEntity } from "./baseEntity";
// import type { PlutomiId } from "../plutomiId";

// type ApplicationTotals = {
//   applicants: number;
//   stages: number;
// };

// type ApplicationRelatedToArray = [
//   ...RelatedToArray<AllEntityNames.Application>,
//   // Get all applications for an org
//   { id: PlutomiId<AllEntityNames.Org>; type: RelatedToType.Org },
//   // Get all applications for a workspace
//   { id: PlutomiId<AllEntityNames.Workspace>; type: RelatedToType.Workspace }
// ];

// export type Application = BaseEntity<AllEntityNames.Application> & {
//   name: string;
//   org: string;
//   workspace: string;
//   totals: ApplicationTotals;
//   relatedTo: ApplicationRelatedToArray;
// };
