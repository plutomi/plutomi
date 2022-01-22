import axios, { AxiosResponse } from "axios";
import { nanoid } from "nanoid";
import { API_URL, DEFAULTS, EMAILS, ENTITY_TYPES, ERRORS } from "../Config";

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
      expect(error.response.data.message).toBe(
        "Hmm... that email doesn't seem quite right. Check it again."
      );
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

  it("bocks you from creating an org if you have pending invites", async () => {
    // Create another user
    const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`, {
      email: EMAILS.TESTING2, // invited up above
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

  //   it("blocks viewing org invites if you don't belong to that org ", async () => {});

  //   it("allows you to reject invites");
  //   it("allows you to accept invites");
});
