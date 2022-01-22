import axios, { AxiosResponse } from "axios";
import { nanoid } from "nanoid";
import { API_URL, DEFAULTS, EMAILS, ENTITY_TYPES, ERRORS } from "../Config";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

describe("Openings", () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`);
    const cookie = data.headers["set-cookie"][0];

    axios.defaults.headers.Cookie = cookie;
  });

  it("blocks creating invites if you're not in an org", async () => {
    try {
      await axios.post(API_URL + "/invites");
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it("blocks viewing your invites if you're not in an org", async () => {
    try {
      await axios.get(API_URL + "/invites");
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  const orgId = nanoid(20);
  it("blocks creating invites if recipientEmail is not an email", async () => {
    // Create an org
    await axios.post(API_URL + "/orgs", {
      orgId,
      displayName: nanoid(20),
    });

    try {
      await axios.post(API_URL + "/invites", {
        recipientEmail: "beans",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.recipientEmail");
      expect(error.response.data.message).toContain("must be a valid email");
    }
  });

  it("blocks creating invites if recipientEmail is a disposable email", async () => {
    try {
      await axios.post(API_URL + "/invites", {
        recipientEmail: "test@10minutemail.com",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(ERRORS.EMAIL_VALIDATION);
    }
  });

  it("blocks inviting yourself", async () => {
    const self = await axios.get(API_URL + "/users/self");

    try {
      await axios.post(API_URL + "/invites", {
        recipientEmail: self.data.email,
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe("You can't invite yourself");
    }
  });

  it("blocks inviting someone that already has a pending invite for your org", async () => {
    // Create the invite
    await axios.post(API_URL + "/invites", {
      recipientEmail: EMAILS.TESTING2,
    });

    try {
      await axios.post(API_URL + "/invites", {
        recipientEmail: EMAILS.TESTING2,
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        "This user already has a pending invite to your org! They can log in to claim it."
      );
    }
  });

  it("allows creating invites", async () => {
    const res = await axios.post(API_URL + "/invites", {
      recipientEmail: EMAILS.TESTING3,
    });

    expect(res.status).toBe(201);
    expect(res.data.message).toContain("Invite sent to");
  });

  it("allows viewing invites for your org", async () => {
    const self = await axios.get(API_URL + "/users/self");

    // Create the invite
    await axios.post(API_URL + "/invites", {
      recipientEmail: EMAILS.TESTING4,
    });

    const response = await axios.get(
      API_URL + `/orgs/${self.data.orgId}/invites`
    );

    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThanOrEqual(1);
    expect(response.data[0].createdBy.email).toBe(self.data.email);
  });

  // ToDO this returns you already belong to an org as that is the first thing that is checked
  it("blocks you from creating an org if you have pending invites", async () => {
    // Create another user
    const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`, {
      email: EMAILS.TESTING3, // invited up above
    });
    const cookie = data.headers["set-cookie"][0];

    axios.defaults.headers.Cookie = cookie;

    await axios.get(API_URL + "/users/self");

    try {
      // TODO ORG not joining, causing errors
      await axios.post(API_URL + "/orgs", {
        orgId: nanoid(10),
        displayName: nanoid(20),
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.HAS_PENDING_INVITES);
    }
  });

  it("allows you as a user to view your pending invites", async () => {
    const self = await axios.get(API_URL + "/users/self");

    const res = await axios.get(API_URL + "/invites");
    expect(res.status).toBe(200);
    expect(res.data.length).toBeGreaterThanOrEqual(1); // TODO invites not being created
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
  it("allows you to accept invites", async () => {
    // Create a new user
    const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`, {
      email: `${nanoid(7)}+${EMAILS.TESTING}`,
    });
    const cookie = data.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie;
    // const self = await axios.get(API_URL + "/users/self");

    const orgId = tagGenerator.generate(nanoid(20));

    // Join org
    await axios.post(API_URL + "/orgs", { orgId, displayName: nanoid(20) });

    const otherUserEmail = `${nanoid(7)}+${EMAILS.TESTING3}`;
    // Create an invite for another user
    await axios.post(API_URL + "/invites", {
      recipientEmail: otherUserEmail,
    });

    // Sign in as that other user
    const data2: AxiosResponse = await axios.post(API_URL + `/jest-setup`, {
      email: otherUserEmail,
    });
    const cookie2 = data2.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie2;

    const invites = await axios.get(API_URL + "/invites");

    const ourInvite = invites.data.find((invite) => invite.orgId === orgId);
    const accepted = await axios.post(
      API_URL + `/invites/${ourInvite.inviteId}`
    );

    const self = await axios.get(API_URL + "/users/self");
    expect(accepted.status).toBe(200);
    expect(accepted.data.message).toContain("You've joined the");
    expect(self.data.orgId).toBe(orgId);
  });

  it("allows rejecting invites", async () => {
    // Create a new user
    const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`, {
      email: `${nanoid(7)}+${EMAILS.TESTING}`,
    });
    const cookie = data.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie;

    // Join org
    const orgId = tagGenerator.generate(nanoid(20));
    await axios.post(API_URL + "/orgs", { orgId, displayName: nanoid(20) });

    const otherUserEmail = `${nanoid(7)}+${EMAILS.TESTING4}`;
    // Create an invite for another user
    await axios.post(API_URL + "/invites", {
      recipientEmail: otherUserEmail,
    });

    // Sign in as that other user
    const data2: AxiosResponse = await axios.post(API_URL + `/jest-setup`, {
      email: otherUserEmail,
    });
    const cookie2 = data2.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie2;

    const invites = await axios.get(API_URL + "/invites");

    const ourInvite = invites.data.find((invite) => invite.orgId === orgId);
    const accepted = await axios.delete(
      API_URL + `/invites/${ourInvite.inviteId}`
    );

    const self = await axios.get(API_URL + "/users/self");
    expect(accepted.status).toBe(200);
    expect(accepted.data.message).toContain("Invite rejected");
    expect(self.data.orgId).toBe("NO_ORG_ASSIGNED");
  });
});
