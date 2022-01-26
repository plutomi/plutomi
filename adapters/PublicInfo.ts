import { AXIOS_INSTANCE as axios } from "../Config";
// TODO types

const GetPublicOrgInfoURL = (orgId) => `/public/orgs/${orgId}`;

const GetPublicOrgInfo = async (orgId) => {
  const { data } = await axios.get(GetPublicOrgInfoURL(orgId));
  return data;
};

const GetPublicOpeningsURL = (orgId) => `/public/orgs/${orgId}/openings`;

const GetPublicOpenings = async (orgId) => {
  const { data } = await axios.get(GetPublicOpeningsURL(orgId));
  return data;
};

const GetPublicOpeningInfoURL = (orgId, openingId) =>
  `/public/orgs/${orgId}/openings/${openingId}`;

const GetPublicOpeningInfo = async (orgId, openingId) => {
  const { data } = await axios.get(GetPublicOpeningInfoURL(orgId, openingId));
  return data;
};

const GetPublicStageInfoURL = (orgId, openingId, stageId) =>
  `/public/orgs/${orgId}/openings/${openingId}/stages/${stageId}`;

const GetPublicStageInfo = async (orgId, openingId, stageId) => {
  const { data } = await axios.get(
    GetPublicStageInfoURL(orgId, openingId, stageId)
  );
  return data;
};

// TODO remove this once applicant login portal is in
const GetPublicApplicantInfoURL = (applicantId) => {
  return `/applicants/${applicantId}`;
};
const GetPublicApplicantInfo = async (applicantId) => {
  const { data } = await axios.get(GetPublicApplicantInfoURL(applicantId));
  return data;
};

export {
  GetPublicOrgInfoURL,
  GetPublicOrgInfo,
  GetPublicOpeningsURL,
  GetPublicOpenings,
  GetPublicOpeningInfo,
  GetPublicOpeningInfoURL,
  GetPublicStageInfoURL,
  GetPublicStageInfo,
  GetPublicApplicantInfoURL,
  GetPublicApplicantInfo,
};
