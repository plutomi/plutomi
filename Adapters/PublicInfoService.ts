import axios from "../axios/axios";

export default class PublicInfoService {
  static getPublicOrgURL({ org_id }) {
    return `/api/public/orgs/${org_id}`;
  }
  static async getPublicOrg({ org_id }) {
    const { data } = await axios.get(this.getPublicOrgURL({ org_id }));
    return data;
  }

  static getAllPublicOpeningsURL({ org_id }) {
    return `/api/public/orgs/${org_id}/openings`;
  }

  static async getAllPublicOpenings({ org_id }) {
    const { data } = await axios.get(this.getAllPublicOpeningsURL({ org_id }));
    return data;
  }

  static getPublicOpeningURL({ org_id, openingId }) {
    return `/api/public/orgs/${org_id}/openings/${openingId}`;
  }

  static async getPublicOpening({ org_id, openingId }) {
    const { data } = await axios.get(
      this.getPublicOpeningURL({ org_id, openingId })
    );
    return data;
  }

  static getPublicStageURL({ org_id, openingId, stage_id }) {
    return `/api/public/orgs/${org_id}/openings/${openingId}/stages/${stage_id}`;
  }

  static async getPublicStage({ org_id, openingId, stage_id }) {
    const { data } = await axios.get(
      this.getPublicStageURL({ org_id, openingId, stage_id })
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
