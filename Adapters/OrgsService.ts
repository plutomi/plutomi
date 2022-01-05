import axios from "../utils/axios";

export default class OrgsService {
  // TODO remove class
  static async createOrg(displayName, orgId) {
    const body = {
      displayName,
      orgId,
    };

    const { data } = await axios.post(`/orgs`, body);
    return data;
  }

  static getOrgURL(orgId) {
    return `/orgs/${orgId}`;
  }
  static async getOrg(orgId) {
    const { data } = await axios.get(this.getOrgURL(orgId));
    return data;
  }

  static async deleteOrg(orgId) {
    const { data } = await axios.delete(`/orgs/${orgId}`);
    return data;
  }

  static getAllUsersInOrgURL(orgId) {
    return `/users`;
  }

  static async getAllUsersInOrg(orgId) {
    const { data } = await axios.get(this.getAllUsersInOrgURL(orgId));
    return data;
  }

  // TODO add get all invites for org
}
