import axios, { AxiosResponse } from "axios";
import { nanoid } from "nanoid";
import { API_URL, DEFAULTS, EMAILS, ENTITY_TYPES, ERRORS } from "../Config";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

describe("Orgs", () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`);
    const cookie = data.headers["set-cookie"][0];

    axios.defaults.headers.Cookie = cookie;
  });

  it("blocks the default orgId from being used to create an org - 1", async () => {
    try {
      await axios.post(API_URL + "/orgs", {
        orgId: tagGenerator.generate(DEFAULTS.NO_ORG),
        displayName: "Beans",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.orgId");
      expect(error.response.data.message).toContain(
        "contains an invalid value"
      );
    }
  });

  it("blocks the default orgId from being used to create an org - 2", async () => {
    try {
      await axios.post(API_URL + "/orgs", {
        orgId: tagGenerator.generate(DEFAULTS.NO_ORG),
        displayName: "Beans",
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.orgId");
      expect(error.response.data.message).toContain(
        "contains an invalid value"
      );
    }
  });

  it("blocks users not in an org from viewing org info", async () => {
    try {
      await axios.get(API_URL + "/orgs");
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  const orgId = tagGenerator.generate(nanoid(15));
  const displayName = nanoid(10);
  it("allows a user to create an org", async () => {
    const data = await axios.post(API_URL + "/orgs", {
      orgId,
      displayName,
    });

    expect(data.status).toBe(201);
    expect(data.data.message).toBe("Org created!");
  });
  it("blocks users in an org from being able to create another one", async () => {
    try {
      await axios.post(API_URL + "/orgs", {
        orgId: nanoid(10),
        displayName: nanoid(10),
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe("You already belong to an org!");
    }
  });

  it("allows retrieving users from an org", async () => {
    // Since we will be the only users in the org,
    // we can verify that the only user that is returned is us
    const self = await axios.get(API_URL + "/users/self");
    const data = await axios.get(API_URL + "/users");
    expect(data.status).toBe(200);
    expect(data.data[0].userId).toBe(self.data.userId);
  });

  it("retrieves information about our org", async () => {
    const data = await axios.get(API_URL + "/orgs");

    expect(data.status).toBe(200);
    expect(data.data.orgId).toBe(orgId);
    expect(data.data.displayName).toBe(displayName);
    expect(data.data.totalUsers).toBe(1);
    expect(data.data.totalApplicants).toBe(0);
    expect(data.data.totalOpenings).toBe(0);
  });

  it("blocks you from deleting an org if there are other users", async () => {
    // Create a new user
    const firstUserEmail = `${nanoid(7)}+${EMAILS.TESTING}`;
    const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`, {
      email: firstUserEmail,
    });
    const cookie = data.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie;

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
    // Accept the invite
    await axios.post(API_URL + `/invites/${ourInvite.inviteId}`);

    // Sign back in as the first user
    await axios.post(API_URL + `/jest-setup`, {
      email: firstUserEmail,
    });

    const orgInfo = await axios.get(API_URL + "/orgs");
    expect(orgInfo.data.totalUsers).toBe(2);

    try {
      await axios.delete(API_URL + "/orgs");
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        "You cannot delete this org as there are other users in it"
      );
    }
  });

  it("deletes an org if you're the only user in it", async () => {
    // Create a new user
    const firstUserEmail = `${nanoid(7)}+${EMAILS.TESTING}`;
    const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`, {
      email: firstUserEmail,
    });
    const cookie = data.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie;

    const orgId = tagGenerator.generate(nanoid(20));

    // Join org
    await axios.post(API_URL + "/orgs", { orgId, displayName: nanoid(20) });
    const deleteOrg = await axios.delete(API_URL + "/orgs");
    expect(deleteOrg.status).toBe(200);
    expect(deleteOrg.data.message).toBe("Org deleted!");
  });
});
