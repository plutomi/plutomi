import axios from "../axios/axios";

export default class InvitesService {
  static async createInvite({ org_id, recipient_email }: APICreateInviteInput) {
    const body = {
      recipient_email: recipient_email,
    };
    const { data } = await axios.post(`/api/orgs/${org_id}/invite`, body);
    return data;
  }

  static async rejectInvite() {
    const { data } = await axios.post(`${URL}`);
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
