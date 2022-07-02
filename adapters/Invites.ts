import { AXIOS_INSTANCE as axios } from '../Config';
// TODO types

interface CreateInviteInput {
  recipientEmail: string;
  expiresInDays?: number;
}
export const CreateInvite = async (options: CreateInviteInput) => {
  const data = await axios.post(`/invites`, { ...options });
  return data;
};

export const AcceptInvite = async (inviteId: string) => {
  const data = await axios.post(`/invites/${inviteId}`);
  return data;
};

// As a recipient, reject this invite
export const RejectInvite = async (inviteId: string) => {
  const data = await axios.delete(`/invites/${inviteId}`);
  return data;
};

interface CancelInviteInput {
  inviteId: string;
  userId: string;
  orgId: string;
}
// As an org user, cancel a pending invite - // TODO i don't like this route
export const CancelInvite = async (options: CancelInviteInput) => {
  const { inviteId, userId, orgId } = options;
  const data = await axios.post(`/orgs/${orgId}/invites/cancel`, {
    inviteId,
    userId,
  });
  return data;
};

export const GetUserInvitesURL = () => `/invites`;

export const GetUserInvites = async () => {
  const data = await axios.get(GetUserInvitesURL());
  return data;
};

export const GetOrgInvitesURL = (orgId: string) => `/orgs/${orgId}/invites`;

export const GetOrgInvites = async (orgId: string) => {
  const data = await axios.get(GetOrgInvitesURL(orgId));
  return data;
};
