import { AXIOS_INSTANCE as axios } from "../Config";

const GetPublicOrgInfoURL = (orgId: string) => `/public/orgs/${orgId}`;

const GetPublicOrgInfo = async (orgId: string) => {
  const data = await axios.get(GetPublicOrgInfoURL(orgId));
  return data;
};

const GetPublicOpeningsURL = (orgId: string) =>
  `/public/orgs/${orgId}/openings`;

const GetPublicOpenings = async (orgId: string) => {
  const data = await axios.get(GetPublicOpeningsURL(orgId));
  return data;
};

interface GetPublicOpeningInfoInput {
  orgId: string;
  openingId: string;
}
const GetPublicOpeningInfoURL = (options: GetPublicOpeningInfoInput) =>
  `/public/orgs/${options.orgId}/openings/${options.openingId}`;

const GetPublicOpeningInfo = async (options: GetPublicOpeningInfoInput) => {
  const data = await axios.get(GetPublicOpeningInfoURL(options));
  return data;
};

interface GetPublicStageInfoInput {
  orgId: string;
  openingId: string;
  stageId: string;
}
const GetPublicStageInfoURL = (options: GetPublicStageInfoInput) =>
  `/public/orgs/${options.orgId}/openings/${options.openingId}/stages/${options.stageId}`;

const GetPublicStageInfo = async (options: GetPublicStageInfoInput) => {
  const data = await axios.get(GetPublicStageInfoURL(options));
  return data;
};

// TODO remove this once applicant login portal is in
const GetPublicApplicantInfoURL = (applicantId: string) => {
  return `/applicants/${applicantId}`;
};
const GetPublicApplicantInfo = async (applicantId: string) => {
  const data = await axios.get(GetPublicApplicantInfoURL(applicantId));
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
