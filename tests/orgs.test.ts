import axios, { AxiosResponse } from "axios";
import { nanoid } from "nanoid";
import { API_URL, DEFAULTS, ENTITY_TYPES } from "../Config";
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

  it("Allows a user to create an org", async () => {
    const data = await axios.post(API_URL + "/orgs", {
      orgId: nanoid(10),
      displayName: nanoid(10),
    });

    expect(data.status).toBe(201);
    expect(data.data.message).toBe("Org created!");
  });
  it("Blocks users in an org from being able to create another one", async () => {
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
});
