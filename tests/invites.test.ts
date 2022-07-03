import { nanoid } from 'nanoid';
import { Emails, ERRORS, AXIOS_INSTANCE as axios } from '../Config';
import * as Invites from '../adapters/Invites';
import * as Orgs from '../adapters/Orgs';
import * as Users from '../adapters/Users';
import { DynamoOrgInvite } from '../types/dynamo';
import TagGenerator from '../utils/tagGenerator';

describe('Openings', () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;
  });

  it("blocks creating invites if you're not in an org", async () => {
    expect.assertions(2);
    try {
      await Invites.CreateInvite({
        recipientEmail: '',
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it("blocks viewing org invites if a user doesn't have an org", async () => {
    expect.assertions(2);
    try {
      await Invites.GetOrgInvites('123');
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  const orgId = nanoid(20);

  it('blocks viewing org invites for different orgs', async () => {
    expect.assertions(2);
    await Orgs.CreateOrg({
      orgId,
      displayName: nanoid(20),
    });
    try {
      await Invites.GetOrgInvites('123');
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NOT_SAME_ORG);
    }
  });

  it('blocks creating invites if recipientEmail is not an email', async () => {
    expect.assertions(3);

    try {
      await Invites.CreateInvite({
        recipientEmail: 'beans',
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.recipientEmail');
      expect(error.response.data.message).toContain('must be a valid email');
    }
  });

  it('blocks creating invites if recipientEmail is a disposable email', async () => {
    expect.assertions(2);
    try {
      await Invites.CreateInvite({
        recipientEmail: 'test@10minutemail.com',
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(ERRORS.EMAIL_VALIDATION);
    }
  });

  it('blocks inviting yourself', async () => {
    expect.assertions(2);
    const self = await Users.GetSelfInfo();

    try {
      await Invites.CreateInvite({
        recipientEmail: self.data.email,
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe("You can't invite yourself");
    }
  });

  it('blocks inviting someone that already has a pending invite for your org', async () => {
    expect.assertions(2);
    // Create the invite
    await Invites.CreateInvite({
      recipientEmail: Emails.TESTING2,
    });

    try {
      // Try it again
      await Invites.CreateInvite({
        recipientEmail: Emails.TESTING2,
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        'This user already has a pending invite to your org! They can log in to claim it.',
      );
    }
  });

  it('allows creating invites', async () => {
    expect.assertions(2);
    const data = await Invites.CreateInvite({
      recipientEmail: Emails.TESTING3,
    });
    expect(data.status).toBe(201);
    expect(data.data.message).toContain('Invite sent to');
  });

  it('allows viewing invites for your org', async () => {
    expect.assertions(3);
    const self = await Users.GetSelfInfo();

    // Create the invite
    await Invites.CreateInvite({
      recipientEmail: Emails.TESTING4,
    });

    // TODO this needs to be implemented in the frontend
    const response = await Invites.GetOrgInvites(self.data.orgId);
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThanOrEqual(1);
    expect(response.data[0].createdBy.email).toBe(self.data.email);
  });

  it('blocks you from creating an org if you have pending invites', async () => {
    expect.assertions(2);
    // Create another user
    const data = await axios.post(`/jest-setup`, {
      email: Emails.TESTING3, // invited up above
    });
    const cookie = data.headers['set-cookie'][0];

    axios.defaults.headers.Cookie = cookie;

    try {
      await Orgs.CreateOrg({
        orgId: nanoid(10),
        displayName: nanoid(20),
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.HAS_PENDING_INVITES);
    }
  });

  it('allows you as a user to view your pending invites', async () => {
    expect.assertions(3);
    const self = await Users.GetSelfInfo();
    const res = await Invites.GetUserInvites();
    expect(res.status).toBe(200);
    expect(res.data.length).toBeGreaterThanOrEqual(1);
    expect(res.data[0].recipient.email).toBe(self.data.email);
  });

  // TODO
  /**
   * This one requires:
   * 1. Creating a user
   * 2. Switching to another user
   * 3. Inviting the first user
   * 4. Switching back
   * 5. Creating an org on the first user
   * 6. Trying to view the 2nd user's org's invites
   *
   * This is because a new user gets blocked if they try to view another org's invites
   * for not having an org, which is fine, but also to test the same_org middleware,
   * we need to give the first user an org. If we invite the first user
   * before they create an org, they get blocked from creating the org
   * due to having pending invites.. lol.
   * Might just skip this one for now..
   */
  //   it("blocks viewing org invites if you don't belong to that org ", async () => {});

  // TODO -

  // Create a user
  // Create an org
  // Invite another user
  // Sign in as that user
  // Accept / reject
  it('allows you to accept invites', async () => {
    expect.assertions(3);
    // Create a new user
    const data = await axios.post(`/jest-setup`, {
      email: `${nanoid(20)}+${Emails.TESTING}`,
    });
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;

    const orgId = TagGenerator({
      value: 20,
    });

    // Join org
    await Orgs.CreateOrg({
      orgId,
      displayName: nanoid(20),
    });

    const otherUserEmail = `${nanoid(20)}+${Emails.TESTING3}`;
    // Create an invite for another user
    await Invites.CreateInvite({
      recipientEmail: otherUserEmail,
    });

    // Sign in as that other user
    const data2 = await axios.post(`/jest-setup`, {
      email: otherUserEmail,
    });
    const cookie2 = data2.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie2;

    const invites = await Invites.GetUserInvites();

    const ourInvite = invites.data.find((invite: DynamoOrgInvite) => invite.orgId === orgId);
    const accepted = await Invites.AcceptInvite(ourInvite.inviteId);

    const self = await Users.GetSelfInfo();
    expect(accepted.status).toBe(200);
    expect(accepted.data.message).toContain("You've joined the");
    expect(self.data.orgId).toBe(orgId);
  });

  it('allows rejecting invites', async () => {
    expect.assertions(3);
    // Create a new user
    const data = await axios.post(`/jest-setup`, {
      email: `${nanoid(20)}+${Emails.TESTING}`,
    });
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;

    // Join org
    const orgId = TagGenerator({
      value: 20,
    });
    await Orgs.CreateOrg({ orgId, displayName: nanoid(20) });

    const otherUserEmail = `${nanoid(20)}+${Emails.TESTING4}`;
    // Create an invite for another user
    await Invites.CreateInvite({
      recipientEmail: otherUserEmail,
    });

    // Sign in as that other user
    const data2 = await axios.post(`/jest-setup`, {
      email: otherUserEmail,
    });
    const cookie2 = data2.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie2;

    const invites = await Invites.GetUserInvites();

    const ourInvite = invites.data.find((invite: DynamoOrgInvite) => invite.orgId === orgId);
    const accepted = await Invites.RejectInvite(ourInvite.inviteId);

    const self = await Users.GetSelfInfo();
    expect(accepted.status).toBe(200);
    expect(accepted.data.message).toContain('Invite rejected');
    expect(self.data.orgId).toBe('NO_ORG_ASSIGNED');
  });

  it('allows cancelling invites as an org user', async () => {
    expect.assertions(2);
    // Create a new user
    const data = await axios.post(`/jest-setup`, {
      email: `${nanoid(20)}+${Emails.TESTING}`,
    });
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;

    // Join org
    const orgId = TagGenerator({
      value: 20,
    });
    await Orgs.CreateOrg({ orgId, displayName: nanoid(20) });

    const otherUserEmail = `${nanoid(20)}+${Emails.TESTING4}`.toLowerCase();

    // Create an invite for another user
    await Invites.CreateInvite({
      recipientEmail: otherUserEmail,
    });

    const allOrgInvites = await Invites.GetOrgInvites(orgId);

    const ourInvite: DynamoOrgInvite = allOrgInvites.data.find(
      (invite: DynamoOrgInvite) => invite.recipient.email === otherUserEmail,
    );

    const cancelStatus = await Invites.CancelInvite({
      inviteId: ourInvite.inviteId,
      userId: ourInvite.recipient.userId,
      orgId: ourInvite.orgId,
    });

    expect(cancelStatus.status).toBe(200);
    expect(cancelStatus.data.message).toBe('Invite cancelled!');
  });

  it('allows users to set (in days) how long an invite is valid for', async () => {
    expect.assertions(2);
    // Create a new user
    const data = await axios.post(`/jest-setup`, {
      email: `${nanoid(20)}+${Emails.TESTING}`,
    });
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;

    // Join org
    const orgId = TagGenerator({
      value: 20,
    });
    await Orgs.CreateOrg({ orgId, displayName: nanoid(20) });

    const otherUserEmail = `${nanoid(20)}+${Emails.TESTING4}`;
    // Create an invite for another user
    const result = await Invites.CreateInvite({
      recipientEmail: otherUserEmail,
      expiresInDays: 20,
    });

    expect(result.status).toBe(201);
    expect(result.data.message).toBe(`Invite sent to '${otherUserEmail}'`);
  });

  it('blocks 0 or negative values from being set as invite expiry', async () => {
    expect.assertions(3);
    // Create a new user
    const data = await axios.post(`/jest-setup`, {
      email: `${nanoid(20)}+${Emails.TESTING}`,
    });
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;

    // Join org
    const orgId = TagGenerator({
      value: 20,
    });
    await Orgs.CreateOrg({ orgId, displayName: nanoid(20) });

    const otherUserEmail = `${nanoid(20)}+${Emails.TESTING4}`;
    // Create an invite for another user
    try {
      await Invites.CreateInvite({
        recipientEmail: otherUserEmail,
        expiresInDays: 0,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.expiresInDays');
      expect(error.response.data.message).toContain('greater than or equal to 1');
    }
  });

  it('blocks values greater than 365 from being set as invite expiry', async () => {
    expect.assertions(3);
    // Create a new user
    const data = await axios.post(`/jest-setup`, {
      email: `${nanoid(20)}+${Emails.TESTING}`,
    });
    const cookie = data.headers['set-cookie'][0];
    axios.defaults.headers.Cookie = cookie;

    // Join org
    const orgId = TagGenerator({
      value: 20,
    });
    await Orgs.CreateOrg({ orgId, displayName: nanoid(20) });

    const otherUserEmail = `${nanoid(20)}+${Emails.TESTING4}`;
    // Create an invite for another user
    try {
      await Invites.CreateInvite({
        recipientEmail: otherUserEmail,
        expiresInDays: 500,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('body.expiresInDays');
      expect(error.response.data.message).toContain('less than or equal to 365');
    }
  });
});
