import axios from "../utils/axios";
// TODO types

// TODO this needs revamp due to question sets
const CreateQuestion = async (GSI1SK, stageId, questionDescription) => {
  const { data } = await axios.post(`/questions`, {
    stageId,
    GSI1SK,
    questionDescription,
  });
  return data;
};

const GetQuestionInfoURL = (questionId) => {
  return `/questions/${questionId}`;
};
const GetQuestionInfo = async (questionId) => {
  const { data } = await axios.get(GetQuestionInfoURL(questionId));
  return data;
};

const DeleteQuestion = async (questionId) => {
  const { data } = await axios.delete(GetQuestionInfoURL(questionId));
  return data;
};

const UpdateQuestion = async (questionId, newValues) => {
  const { data } = await axios.put(GetQuestionInfoURL(questionId), newValues);
  return data;
};

// TODO wrong url, also needs revamp with question sets.
// TODO move to questions
const GetAllQuestionsInStageURL = (openingId, stageId) =>
  `/openings/${openingId}/stages/${stageId}/questions`;

const GetAllQuestionsInStage = async (openingId, stageId) => {
  const { data } = await axios.get(
    GetAllQuestionsInStageURL(openingId, stageId)
  );
  return data;
};
export {
  CreateQuestion,
  UpdateQuestion,
  DeleteQuestion,
  GetQuestionInfo,
  GetQuestionInfoURL,
  GetAllQuestionsInStageURL,
  GetAllQuestionsInStage,
};
