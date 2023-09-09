// import type { RelatedToType, RelatedToArray } from "../indexableProperties";
// import type { PlutomiId } from "../plutomiId";
// import type { IdPrefix } from "./idPrefix";
// import type { BaseEntity } from "./baseEntity";

// type StageTotals = {
//   applicants: number;
//   questions: number;
// };

// type StageRelatedToArray = [
//   ...RelatedToArray<IdPrefix.Stage>,
//   // Get all stages in an application
//   { id: PlutomiId<IdPrefix.Application>; type: RelatedToType.Stage },
//   // Get all stages in an org
//   {
//     id: PlutomiId<IdPrefix.Org>;
//     type: RelatedToType.Stage;
//   },
//   // Get all stages in a workspace
//   {
//     id: PlutomiId<IdPrefix.Workspace>;
//     type: RelatedToType.Stage;
//   }
// ];

// export type Stage = BaseEntity<IdPrefix.Stage> & {
//   name: string;
//   org: string;
//   workspace: string;
//   totals: StageTotals;
//   related_to: StageRelatedToArray;
// };
