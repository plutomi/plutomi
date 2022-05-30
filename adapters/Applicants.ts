import { AXIOS_INSTANCE as axios } from '../Config';
import { APICreateApplicantOptions } from '../Controllers/Applicants/createApplicant';

const CreateApplicant = async (options: APICreateApplicantOptions) => {
  const data = await axios.post(`/applicants`, { ...options });
  return data;
};

const GetApplicantByIdURL = (applicantId: string) => `/applicants/${applicantId}`;

const GetApplicantById = async (applicantId: string) => {
  const data = await axios.get(GetApplicantByIdURL(applicantId));
  return data;
};

const DeleteApplicant = async (applicantId: string) => {
  const data = await axios.delete(GetApplicantByIdURL(applicantId));
  return data;
};

// TODO types - not implemented yet in v2
const UpdateApplicant = async (applicantId, newValues) => {
  const data = await axios.put(GetApplicantByIdURL(applicantId), newValues);
  return data;
};

// TODO rework this one
const AnswerQuestionsURL = (applicantId: string) => `/applicants/${applicantId}/answer`; // TODO applicantId is being used in query as well as body. TODO maybe add unique question ids?
const AnswerQuestions = async (applicantId, responses) => {
  const data = await axios.post(AnswerQuestionsURL(applicantId), {
    applicantId,
    responses,
  });
  return data;
};
interface GetApplicantsInStageInput {
  openingId: string;
  stageId: string;
}
const GetApplicantsInStageURL = (options: GetApplicantsInStageInput) =>
  `/openings/${options.openingId}/stages/${options.stageId}/applicants`;

const GetApplicantsInStage = async (options: GetApplicantsInStageInput) => {
  const data = await axios.get(GetApplicantsInStageURL(options));
  return data;
};

export {
  CreateApplicant,
  GetApplicantByIdURL,
  GetApplicantById,
  DeleteApplicant,
  UpdateApplicant,
  AnswerQuestionsURL,
  AnswerQuestions,
  GetApplicantsInStageURL,
  GetApplicantsInStage,
};
