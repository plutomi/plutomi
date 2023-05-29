// import type { IdPrefix } from "./idPrefix";
// import type { RelatedToType, RelatedToArray } from "../indexableProperties";
// import type { BaseEntity } from "./baseEntity";
// import type { PlutomiId } from "../plutomiId";

// type ApplicationTotals = {
//   applicants: number;
//   stages: number;
// };

// type ApplicationRelatedToArray = [
//   ...RelatedToArray<IdPrefix.Application>,
//   // Get all applications for an org
//   { id: PlutomiId<IdPrefix.Org>; type: RelatedToType.Org },
//   // Get all applications for a workspace
//   { id: PlutomiId<IdPrefix.Workspace>; type: RelatedToType.Workspace }
// ];

// export type Application = BaseEntity<IdPrefix.Application> & {
//   name: string;
//   org: string;
//   workspace: string;
//   totals: ApplicationTotals;
//   relatedTo: ApplicationRelatedToArray;
// };
