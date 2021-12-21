import axios from "../utils/axios";

export default class PublicInfoService {
  static getPublicOrgURL(orgId) {
    return `/public/${orgId}`;
  }
  static async getPublicOrg(orgId) {
    const { data } = await axios.get(this.getPublicOrgURL(orgId));
    return data;
  }

  static getAllPublicOpeningsURL(orgId) {
    return `/public/${orgId}/openings`;
  }

  static async getAllPublicOpenings(orgId) {
    const { data } = await axios.get(this.getAllPublicOpeningsURL(orgId));
    return data;
  }

  static getPublicOpeningURL(orgId, openingId) {
    return `/public/${orgId}/openings/${openingId}`;
  }

  static async getPublicOpening(orgId, openingId) {
    const { data } = await axios.get(
      this.getPublicOpeningURL(orgId, openingId)
    );
    return data;
  }

  static getPublicStageURL(orgId, openingId, stageId) {
    return `/public/${orgId}/openings/${openingId}/stages/${stageId}`;
  }

  static async getPublicStage(orgId, openingId, stageId) {
    const { data } = await axios.get(
      this.getPublicStageURL(orgId, openingId, stageId)
    );
    return data;
  }

  // Identical to the call in applicants service, however auth is not required
  static getPublicApplicantURL(applicantId) {
    return `/applicants/${applicantId}`;
  }
  static async getPublicApplicant(applicantId) {
    const { data } = await axios.get(this.getPublicApplicantURL(applicantId));
    return data;
  }
}
