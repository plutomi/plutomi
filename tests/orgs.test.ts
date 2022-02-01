import { nanoid } from "nanoid";
import { DEFAULTS, EMAILS, ERRORS, AXIOS_INSTANCE as axios } from "../Config";
import * as Orgs from "../adapters/Orgs";
import * as Users from "../adapters/Users";
import * as Invites from "../adapters/Invites";
import { DynamoOrgInvite } from "../types/dynamo";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

describe("Orgs", () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie;
  });

  it("blocks the default orgId from being used to create an org - 1", async () => {
    expect.assertions(3);
    try {
      await Orgs.CreateOrg({
        displayName: "Beans",
        orgId: tagGenerator.generate(DEFAULTS.NO_ORG),
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
    expect.assertions(3);
    try {
      await Orgs.CreateOrg({
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
    expect.assertions(2);
    try {
      await Orgs.GetOrgInfo();
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  const orgId = tagGenerator.generate(nanoid(15));
  const displayName = nanoid(10);

  it("allows a user to create an org", async () => {
    expect.assertions(2);
    const data = await Orgs.CreateOrg({
      orgId,
      displayName,
    });

    expect(data.status).toBe(201);
    expect(data.data.message).toBe("Org created!");
  });
  it("blocks users in an org from being able to create another one", async () => {
    expect.assertions(2);
    try {
      await Orgs.CreateOrg({
        orgId: nanoid(10),
        displayName: nanoid(10),
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe("You already belong to an org!");
    }
  });

  it("allows retrieving users from an org", async () => {
    expect.assertions(2);
    // Since we will be the only users in the org,
    // we can verify that the only user that is returned is us
    const self = await Users.GetSelfInfo();
    const data = await Users.GetUsersInOrg();
    expect(data.status).toBe(200);
    expect(data.data[0].userId).toBe(self.data.userId);
  });

  it("retrieves information about our org", async () => {
    expect.assertions(6);
    const data = await Orgs.GetOrgInfo();

    expect(data.status).toBe(200);
    expect(data.data.orgId).toBe(orgId);
    expect(data.data.displayName).toBe(displayName);
    expect(data.data.totalUsers).toBe(1);
    expect(data.data.totalApplicants).toBe(0);
    expect(data.data.totalOpenings).toBe(0);
  });

  it("blocks you from deleting an org if there are other users", async () => {
    expect.assertions(3);
    // Create a new user
    const firstUserEmail = `${nanoid(7)}+${EMAILS.TESTING}`;
    const data = await axios.post(`/jest-setup`, {
      email: firstUserEmail,
    });
    const cookie = data.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie;

    const orgId = tagGenerator.generate(nanoid(20));

    // Join org
    await Orgs.CreateOrg({ orgId, displayName: nanoid(20) });

    const otherUserEmail = `${nanoid(7)}+${EMAILS.TESTING3}`;
    // Create an invite for another user

    await Invites.CreateInvite(otherUserEmail);

    // Sign in as that other user
    const data2 = await axios.post(`/jest-setup`, {
      email: otherUserEmail,
    });
    const cookie2 = data2.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie2;

    const invites = await Invites.GetUserInvites();

    const ourInvite = invites.data.find(
      (invite: DynamoOrgInvite) => invite.orgId === orgId
    );
    // Accept the invite
    await Invites.AcceptInvite(ourInvite.inviteId);

    // Sign back in as the first user
    await axios.post(`/jest-setup`, {
      email: firstUserEmail,
    });

    const orgInfo = await Orgs.GetOrgInfo();
    expect(orgInfo.data.totalUsers).toBe(2);

    try {
      await Orgs.DeleteOrg();
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        "You cannot delete this org as there are other users in it"
      );
    }
  });

  it("deletes an org if you're the only user in it", async () => {
    expect.assertions(2);
    // Create a new user
    const firstUserEmail = `${nanoid(7)}+${EMAILS.TESTING}`;
    const data = await axios.post(`/jest-setup`, {
      email: firstUserEmail,
    });
    const cookie = data.headers["set-cookie"][0];
    axios.defaults.headers.Cookie = cookie;

    const orgId = tagGenerator.generate(nanoid(20));

    // Join org
    await Orgs.CreateOrg({ orgId, displayName: nanoid(20) });
    const deleteOrg = await Orgs.DeleteOrg();
    expect(deleteOrg.status).toBe(200);
    expect(deleteOrg.data.message).toBe("Org deleted!");
  });
});
