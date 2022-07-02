import { AXIOS_INSTANCE as axios } from '../Config';
import { APICreateApplicantOptions } from '../Controllers/Applicants/createApplicant';

export const CreateApplicant = async (options: APICreateApplicantOptions) => {
  const data = await axios.post(`/applicants`, { ...options });
  return data;
};

export const GetApplicantByIdURL = (applicantId: string) => `/applicants/${applicantId}`;

export const GetApplicantById = async (applicantId: string) => {
  const data = await axios.get(GetApplicantByIdURL(applicantId));
  return data;
};
export const DeleteApplicant = async (applicantId: string) => {
  const data = await axios.delete(GetApplicantByIdURL(applicantId));
  return data;
};

// TODO types - not implemented yet in v2
export const UpdateApplicant = async (applicantId, newValues) => {
  const data = await axios.put(GetApplicantByIdURL(applicantId), newValues);
  return data;
};

// TODO rework this one
export const AnswerQuestionsURL = (applicantId: string) => `/applicants/${applicantId}/answer`; // TODO applicantId is being used in query as well as body. TODO maybe add unique question ids?
export const AnswerQuestions = async (applicantId, responses) => {
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
export const GetApplicantsInStageURL = (options: GetApplicantsInStageInput) =>
  `/openings/${options.openingId}/stages/${options.stageId}/applicants`;

export const GetApplicantsInStage = async (options: GetApplicantsInStageInput) => {
  const data = await axios.get(GetApplicantsInStageURL(options));
  return data;
};
