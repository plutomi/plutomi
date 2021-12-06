import axios from "../axios";

export default class InvitesService {
  static async createInvite(recipientEmail) {
    const body = {
      recipientEmail: recipientEmail,
    };
    const { data } = await axios.post(`/invites`, body);
    return data;
  }

  static async acceptInvite(inviteId) {
    const { data } = await axios.post(`/invites/${inviteId}`);

    return data;
  }

  static async rejectInvite(inviteId) {
    const { data } = await axios.delete(`/invites/${inviteId}`);
    return data;
  }

  static getInvitesURL(userId) {
    return `/users/${userId}/invites`;
  }

  static async getAllInvites(userId) {
    const { data } = await axios.get(this.getInvitesURL(userId));
    return data;
  }
}
