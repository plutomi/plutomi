import { AXIOS_INSTANCE as axios } from "../Config";
// TODO types
const CreateApplicant = async ({
  orgId,
  openingId,
  firstName,
  lastName,
  email,
}) => {
  const { data } = await axios.post(`/applicants`, {
    orgId,
    openingId,
    firstName,
    lastName,
    email,
  });
  return data;
};

const GetApplicantByIdURL = (applicantId) => `/applicants/${applicantId}`;

const GetApplicantById = async (applicantId) => {
  const { data } = await axios.get(GetApplicantByIdURL(applicantId));
  return data;
};

const DeleteApplicant = async (applicantId) => {
  const { data } = await axios.delete(GetApplicantByIdURL(applicantId));
  return data;
};

const UpdateApplicant = async (applicantId, newValues) => {
  const { data } = await axios.put(GetApplicantByIdURL(applicantId), newValues);
  return data;
};

// TODO rework this one
const AnswerQuestionsURL = (applicantId) => `/applicants/${applicantId}/answer`; // TODO applicantId is being used in query as well as body. TODO maybe add unique question ids?
const AnswerQuestions = async (applicantId, responses) => {
  const { data } = await axios.post(AnswerQuestionsURL(applicantId), {
    applicantId,
    responses,
  });
  return data;
};

const GetApplicantsInStageURL = (openingId, stageId) =>
  `/openings/${openingId}/stages/${stageId}/applicants`;

const GetApplicantsInStage = async (openingId, stageId) => {
  const { data } = await axios.get(GetApplicantsInStageURL(openingId, stageId));
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
