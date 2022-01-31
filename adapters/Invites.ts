import { AXIOS_INSTANCE as axios } from "../Config";
// TODO types

const CreateInvite = async (recipientEmail: string) => {
  const data = await axios.post(`/invites`, { recipientEmail });
  return data;
};

const AcceptInvite = async (inviteId: string) => {
  const data = await axios.post(`/invites/${inviteId}`);
  return data;
};

const RejectInvite = async (inviteId: string) => {
  const data = await axios.delete(`/invites/${inviteId}`);
  return data;
};

const GetUserInvitesURL = () => `/invites`;

const GetUserInvites = async () => {
  const data = await axios.get(GetUserInvitesURL());
  return data;
};

export {
  CreateInvite,
  AcceptInvite,
  RejectInvite,
  GetUserInvites,
  GetUserInvitesURL,
};
