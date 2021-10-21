import axios from "../axios/axios";

export default class PublicInfoService {
  static getPublicOrgURL({ org_id }) {
    return `/api/public/${org_id}`;
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
}
