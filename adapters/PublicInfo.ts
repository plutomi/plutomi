import { AXIOS_INSTANCE as axios } from '../Config';

export const GetPublicOrgInfoURL = (orgId: string) => `/public/orgs/${orgId}`;

export const GetPublicOrgInfo = async (orgId: string) => {
  const data = await axios.get(GetPublicOrgInfoURL(orgId));
  return data;
};

export const GetPublicOpeningsURL = (orgId: string) => `/public/orgs/${orgId}/openings`;

export const GetPublicOpenings = async (orgId: string) => {
  const data = await axios.get(GetPublicOpeningsURL(orgId));
  return data;
};

interface GetPublicOpeningInfoInput {
  orgId: string;
  openingId: string;
}
export const GetPublicOpeningInfoURL = (options: GetPublicOpeningInfoInput) =>
  `/public/orgs/${options.orgId}/openings/${options.openingId}`;

export const GetPublicOpeningInfo = async (options: GetPublicOpeningInfoInput) => {
  const data = await axios.get(GetPublicOpeningInfoURL(options));
  return data;
};

interface GetPublicStageInfoInput {
  orgId: string;
  openingId: string;
  stageId: string;
}
export const GetPublicStageInfoURL = (options: GetPublicStageInfoInput) =>
  `/public/orgs/${options.orgId}/openings/${options.openingId}/stages/${options.stageId}`;

export const GetPublicStageInfo = async (options: GetPublicStageInfoInput) => {
  const data = await axios.get(GetPublicStageInfoURL({ ...options }));
  return data;
};

// TODO remove this once applicant login portal is in
export const GetPublicApplicantInfoURL = (applicantId: string) => `/applicants/${applicantId}`;
export const GetPublicApplicantInfo = async (applicantId: string) => {
  const data = await axios.get(GetPublicApplicantInfoURL(applicantId));
  return data;
};
