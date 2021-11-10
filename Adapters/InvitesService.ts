import axios from "../axios/axios";

export default class InvitesService {
  static async createInvite({ recipient_email }: APICreateInviteInput) {
    const body = {
      recipient_email: recipient_email,
    };
    const { data } = await axios.post(`/api/invites`, body);
    return data;
  }

  static async acceptInvite({ invite_id }) {
    const { data } = await axios.post(`/api/invites/${invite_id}`);

    return data;
  }

  static async rejectInvite({ invite_id }) {
    const { data } = await axios.delete(`/api/invites/${invite_id}`);
    return data;
  }

  static getInvitesURL({ userId }: APIGetInvitesURL) {
    return `/api/users/${userId}/invites`;
  }

  static async getAllInvites({ userId }: APIGetInvites) {
    const { data } = await axios.get(this.getInvitesURL({ userId }));
    return data;
  }
}
