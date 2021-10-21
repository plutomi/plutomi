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

  static getPublicOpeningURL({ org_id, opening_id }) {
    return `/api/public/orgs/${org_id}/openings/${opening_id}`;
  }

  static async getPublicOpening({ org_id, opening_id }) {
    const { data } = await axios.get(
      this.getPublicOpeningURL({ org_id, opening_id })
    );
    return data;
  }

  static getPublicStageURL({ org_id, opening_id, stage_id }) {
    return `/api/public/orgs/${org_id}/openings/${opening_id}/stages/${stage_id}`;
  }

  static async getPublicStage({ org_id, opening_id, stage_id }) {
    const { data } = await axios.get(
      this.getPublicStageURL({ org_id, opening_id, stage_id })
    );
    return data;
  }
}
