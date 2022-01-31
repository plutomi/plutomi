import { AXIOS_INSTANCE as axios } from "../Config";
import { APICreateQuestionOptions } from "../Controllers/Questions/create-questions";
import { APIUpdateQuestionOptions } from "../Controllers/Questions/update-question";

const CreateQuestion = async (options: APICreateQuestionOptions) => {
  const data = await axios.post(`/questions`, {
    ...options,
  });
  return data;
};

const GetQuestionsInOrgURL = () => "/questions";
const GetQuestionInfoURL = (questionId: string) => {
  return `/questions/${questionId}`;
};
const GetQuestionInfo = async (questionId: string) => {
  const data = await axios.get(GetQuestionInfoURL(questionId));
  return data;
};

const DeleteQuestion = async (questionId: string) => {
  const data = await axios.delete(GetQuestionInfoURL(questionId));
  return data;
};
interface UpdateQuestionInput {
  questionId: string;
  newValues: APIUpdateQuestionOptions;
}
const UpdateQuestion = async (options: UpdateQuestionInput) => {
  const data = await axios.put(GetQuestionInfoURL(options.questionId), {
    ...options.newValues,
  });
  return data;
};

// TODO types
interface AddQuestionToStageInput {
  openingId: string;
  stageId: string;
  questionId: string;
}
const AddQuestionToStage = async (options: AddQuestionToStageInput) => {
  const { openingId, stageId, questionId } = options;
  const data = await axios.post(
    `/openings/${openingId}/stages/${stageId}/questions`,
    {
      openingId,
      stageId,
      questionId,
    }
  );

  return data;
};

// // TODO wrong url, also needs revamp with question sets.
// // TODO move to questions
// const GetQuestionsInStageURL = (openingId, stageId) =>
//   `/openings/${openingId}/stages/${stageId}/questions`;

// const GetQuestionsInStage = async (openingId, stageId) => {
//   const  data  = await axios.get(
//     GetQuestionsInStageURL(openingId, stageId)
//   );
//   return data;
// };
export {
  CreateQuestion,
  GetQuestionsInOrgURL,
  UpdateQuestion,
  DeleteQuestion,
  GetQuestionInfo,
  GetQuestionInfoURL,
  AddQuestionToStage,
};
