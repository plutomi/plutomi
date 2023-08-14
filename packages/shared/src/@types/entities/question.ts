// import type { RelatedToType, RelatedToArray } from "../indexableProperties";
// import type { PlutomiId } from "../plutomiId";
// import type { IdPrefix } from "./idPrefix";
// import type { BaseEntity } from "./baseEntity";

// export type QuestionTotals = {
//   stages: number;
// };

// export enum QuestionType {
//   Text = "Text"
//   // TODO: More question types
// }
// type QuestionRelatedToArray = [
//   ...RelatedToArray<IdPrefix.Question>,
//   // Get questions in an org
//   { id: PlutomiId<IdPrefix.Org>; type: RelatedToType.Question },
//   // Get questions in a workspace
//   { id: PlutomiId<IdPrefix.Workspace>; type: RelatedToType.Question }
// ];

// export type Question = BaseEntity<IdPrefix.Question> & {
//   title: string;
//   description: string;
//   org: string;
//   workspace: string;
//   totals: QuestionTotals;
//   related_to: QuestionRelatedToArray;
// };
