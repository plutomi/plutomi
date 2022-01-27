import { AXIOS_INSTANCE as axios } from "../Config";
import { APICreateQuestionOptions } from "../Controllers/Questions/create-questions";

const CreateQuestion = async (options: APICreateQuestionOptions) => {
  const { data } = await axios.post(`/questions`, {
    ...options,
  });
  return data;
};

const GetQuestionsInOrgURL = () => "/questions";
const GetQuestionInfoURL = (questionId: string) => {
  return `/questions/${questionId}`;
};
const GetQuestionInfo = async (questionId: string) => {
  const { data } = await axios.get(GetQuestionInfoURL(questionId));
  return data;
};

const DeleteQuestion = async (questionId: string) => {
  const { data } = await axios.delete(GetQuestionInfoURL(questionId));
  return data;
};

const UpdateQuestion = async (questionId, newValues) => {
  const { data } = await axios.put(GetQuestionInfoURL(questionId), newValues);
  return data;
};

// // TODO wrong url, also needs revamp with question sets.
// // TODO move to questions
// const GetQuestionsInStageURL = (openingId, stageId) =>
//   `/openings/${openingId}/stages/${stageId}/questions`;

// const GetQuestionsInStage = async (openingId, stageId) => {
//   const { data } = await axios.get(
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
};
