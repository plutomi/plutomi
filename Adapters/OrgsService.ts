import axios from "../axios/axios";

export default class OrgsService {
  static async createOrg({ GSI1SK, org_id }) {
    const body = {
      GSI1SK: GSI1SK,
      org_id: org_id,
    };

    const { data } = await axios.post(`/api/orgs`, body);
    console.log("Data", data);
    return data;
  }

  static getOrgURL({ org_id }) {
    return `/api/orgs/${org_id}`;
  }
  static async getOrg({ org_id }) {
    const { data } = await axios.get(this.getOrgURL({ org_id }));
    return data;
  }

  static async deleteOrg({ org_id }) {
    const { data } = await axios.delete(this.getOrgURL({ org_id }));
    return data;
  }

  static getAllUsersInOrgURL({ org_id }: APIGetAllUsersInOrgURL) {
    return `/api/orgs/${org_id}/users`;
  }

  static async getAllUsersInOrg({ org_id }: APIGetAllUsersInOrg) {
    const { data } = await axios.get(this.getAllUsersInOrgURL({ org_id }));
    return data;
  }
}
