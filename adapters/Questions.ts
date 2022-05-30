import { AXIOS_INSTANCE as axios } from '../Config';
import { APICreateQuestionOptions } from '../Controllers/Questions/createQuestion';
import { APIUpdateQuestionOptions } from '../Controllers/Questions/updateQuestion';

const CreateQuestion = async (options: APICreateQuestionOptions) => {
  const data = await axios.post(`/questions`, {
    ...options,
  });
  return data;
};

const GetQuestionsInOrgURL = () => '/questions';
const GetQuestionInfoURL = (questionId: string) => `/questions/${questionId}`;
const GetQuestionInfo = async (questionId: string) => {
  const data = await axios.get(GetQuestionInfoURL(questionId));
  return data;
};

const DeleteQuestionFromOrg = async (questionId: string) => {
  const data = await axios.delete(GetQuestionInfoURL(questionId));
  return data;
};

interface GetQuestionsInStageInput {
  openingId: string;
  stageId: string;
}
const GetQuestionsInStageURL = (options: GetQuestionsInStageInput) =>
  `/openings/${options.openingId}/stages/${options.stageId}/questions`;

const GetQuestionsInStage = async (options: GetQuestionsInStageInput) => {
  const data = await axios.get(GetQuestionsInStageURL(options));
  return data;
};
interface DeleteQuestionFromStageInput {
  openingId: string;
  stageId: string;
  questionId: string;
}
const DeleteQuestionFromStage = async (options: DeleteQuestionFromStageInput) => {
  const { openingId, stageId, questionId } = options;
  const data = await axios.delete(
    `${GetQuestionsInStageURL({ openingId, stageId })}/${questionId}`,
  );
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

interface AddQuestionToStageInput {
  openingId: string;
  stageId: string;
  questionId: string;
  position?: number;
}
const AddQuestionToStage = async (options: AddQuestionToStageInput) => {
  const { openingId, stageId, questionId, position } = options;
  const data = await axios.post(`/openings/${openingId}/stages/${stageId}/questions`, {
    openingId,
    stageId,
    questionId,
    position,
  });

  return data;
};

export {
  CreateQuestion,
  GetQuestionsInOrgURL,
  UpdateQuestion,
  DeleteQuestionFromOrg,
  GetQuestionInfo,
  GetQuestionInfoURL,
  AddQuestionToStage,
  DeleteQuestionFromStage,
  GetQuestionsInStageURL,
  GetQuestionsInStage,
};
