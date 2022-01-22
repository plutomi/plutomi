import axios from "../utils/axios";
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

const GetApplicantURL = (applicantId) => `/applicants/${applicantId}`;

const GetApplicantById = async (applicantId) => {
  const { data } = await axios.get(GetApplicantURL(applicantId));
  return data;
};

const DeleteApplicant = async (applicantId) => {
  const { data } = await axios.delete(GetApplicantURL(applicantId));
  return data;
};

const UpdateApplicant = async (applicantId, newValues) => {
  const { data } = await axios.put(GetApplicantURL(applicantId), newValues);
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

const GetAllApplicantsInStageURL = (openingId, stageId) =>
  `/openings/${openingId}/stages/${stageId}/applicants`;

const GetAllApplicantsInStage = async (openingId, stageId) => {
  const { data } = await axios.get(
    GetAllApplicantsInStageURL(openingId, stageId)
  );
  return data;
};

export {
  CreateApplicant,
  GetApplicantURL,
  GetApplicantById,
  DeleteApplicant,
  UpdateApplicant,
  AnswerQuestionsURL,
  AnswerQuestions,
  GetAllApplicantsInStageURL,
  GetAllApplicantsInStage,
};
