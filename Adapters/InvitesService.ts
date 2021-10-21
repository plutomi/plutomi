import axios from "../axios/axios";

export default class InvitesService {
  static async createInvite({ recipient_email }: APICreateInviteInput) {
    const body = {
      recipient_email: recipient_email,
    };
    const { data } = await axios.post(`/api/invites`, body);
    return data;
  }

  static async acceptInvite({ invite_id, org_id }) {
    const body = {
      org_id: org_id,
    };
    const { data } = await axios.post(`/api/invites/${invite_id}`, body);

    return data;
  }

  static async rejectInvite({ invite_id }) {
    const body = {
      invite_id: invite_id,
    };
    const { data } = await axios.post(`/api/invites/reject`, body);
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
