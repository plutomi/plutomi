import type { IndexableType, RelatedToArray } from "../indexableProperties";
import type { PlutomiId } from "../plutomiId";
import type { AllEntityNames } from "./allEntityNames";
import type { BaseEntity } from "./baseEntity";

// TODO add the explainer here
type StageQuestionItemRelatedToArray = [
  ...RelatedToArray<AllEntityNames.StageQuestionItem>,
  { id: PlutomiId<AllEntityNames.Stage>; type: IndexableType.Id },
  { id: PlutomiId<AllEntityNames.Question>; type: IndexableType.Id }
];

export type StageQuestionItem = BaseEntity<AllEntityNames.StageQuestionItem> & {
  org: string;
  workspace: string;
  relatedTo: StageQuestionItemRelatedToArray;
};
