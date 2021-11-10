import axios from "../axios/axios";

export default class OrgsService {
  static async createOrg({ GSI1SK, orgId }) {
    const body = {
      GSI1SK: GSI1SK,
      orgId: orgId,
    };

    const { data } = await axios.post(`/api/orgs`, body);
    console.log("Data", data);
    return data;
  }

  static getOrgURL({ orgId }) {
    return `/api/orgs/${orgId}`;
  }
  static async getOrg({ orgId }) {
    const { data } = await axios.get(this.getOrgURL({ orgId }));
    return data;
  }

  static async deleteOrg({ orgId }) {
    const { data } = await axios.delete(this.getOrgURL({ orgId }));
    return data;
  }

  static getAllUsersInOrgURL({ orgId }: APIGetAllUsersInOrgURL) {
    return `/api/orgs/${orgId}/users`;
  }

  static async getAllUsersInOrg({ orgId }: APIGetAllUsersInOrg) {
    const { data } = await axios.get(this.getAllUsersInOrgURL({ orgId }));
    return data;
  }
}
