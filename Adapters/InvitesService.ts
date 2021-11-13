import axios from "../axios/axios";

export default class InvitesService {
  static async createInvite({ recipientEmail }) {
    const body = {
      recipientEmail: recipientEmail,
    };
    const { data } = await axios.post(`/api/invites`, body);
    return data;
  }

  static async acceptInvite({ inviteId }) {
    const { data } = await axios.post(`/api/invites/${inviteId}`);

    return data;
  }

  static async rejectInvite({ inviteId }) {
    const { data } = await axios.delete(`/api/invites/${inviteId}`);
    return data;
  }

  static getInvitesURL({ userId }) {
    return `/api/users/${userId}/invites`;
  }

  static async getAllInvites({ userId }: APIGetInvites) {
    const { data } = await axios.get(this.getInvitesURL({ userId }));
    return data;
  }
}
