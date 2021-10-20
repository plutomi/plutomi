import axios from "../axios/axios";

export default class UsersService {
  static getUserURL({ user_id }: APIGetUserURL) {
    return `/api/users/${user_id}`;
  }
  static async getUser({ user_id }: APIGetUserInput) {
    const { data } = await axios.get(this.getUserURL({ user_id }));
    return data;
  }

  static getAllUsersInOrgURL({ org_id }: APIGetAllUsersInOrgURL) {
    return `/api/orgs/${org_id}/users`;
  }

  static async getAllUsersInOrg({ org_id }: APIGetAllUsersInOrg) {
    const { data } = await axios.get(this.getAllUsersInOrgURL({ org_id }));
    return data;
  }

  static async updateUser({ user_id, new_user_values }: APIUpdateUserInput) {
    const body = {
      new_user_values: new_user_values,
    };
    const { data } = await axios.put(this.getUserURL({ user_id }), body);
    return data;
  }

  static getInvitesURL({ user_id }: APIGetInvitesURL) {
    return `/api/users/${user_id}/invites`;
  }

  static async getAllInvites({ user_id }: APIGetInvites) {
    const { data } = await axios.get(this.getInvitesURL({ user_id }));
    return data;
  }
}
