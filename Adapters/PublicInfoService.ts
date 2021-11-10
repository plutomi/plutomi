import axios from "../axios/axios";

export default class PublicInfoService {
  static getPublicOrgURL({ orgId }) {
    return `/api/public/orgs/${orgId}`;
  }
  static async getPublicOrg({ orgId }) {
    const { data } = await axios.get(this.getPublicOrgURL({ orgId }));
    return data;
  }

  static getAllPublicOpeningsURL({ orgId }) {
    return `/api/public/orgs/${orgId}/openings`;
  }

  static async getAllPublicOpenings({ orgId }) {
    const { data } = await axios.get(this.getAllPublicOpeningsURL({ orgId }));
    return data;
  }

  static getPublicOpeningURL({ orgId, opening_id }) {
    return `/api/public/orgs/${orgId}/openings/${opening_id}`;
  }

  static async getPublicOpening({ orgId, opening_id }) {
    const { data } = await axios.get(
      this.getPublicOpeningURL({ orgId, opening_id })
    );
    return data;
  }

  static getPublicStageURL({ orgId, opening_id, stage_id }) {
    return `/api/public/orgs/${orgId}/openings/${opening_id}/stages/${stage_id}`;
  }

  static async getPublicStage({ orgId, opening_id, stage_id }) {
    const { data } = await axios.get(
      this.getPublicStageURL({ orgId, opening_id, stage_id })
    );
    return data;
  }

  // Identical to the call in applicants service, however auth is not required
  static getPublicApplicantURL({ applicant_id }) {
    return `/api/applicants/${applicant_id}`;
  }
  static async getPublicApplicant({ applicant_id }) {
    const { data } = await axios.get(
      this.getPublicApplicantURL({ applicant_id })
    );
    return data;
  }
}
