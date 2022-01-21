import axios, { AxiosResponse } from "axios";
import { nanoid } from "nanoid";
import { API_URL, DEFAULTS, ENTITY_TYPES, ERRORS } from "../Config";
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

  it("fails to create an opening if a user is not in an org", async () => {
    try {
      await axios.post(API_URL + "/openings", {
        GSI1SK: nanoid(10),
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it("fails to create an opening with a large name", async () => {
    // Create an org
    await axios.post(API_URL + "/orgs", {
      orgId: nanoid(20),
      displayName: nanoid(20),
    });

    try {
      await axios.post(API_URL + "/openings", {
        GSI1SK: nanoid(105),
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.GSI1SK");
      expect(error.response.data.message).toContain(
        "less than or equal to 100"
      );
    }
  });

  it("creates an opening", async () => {
    const data = await axios.post(API_URL + "/openings", {
      GSI1SK: nanoid(20),
    });

    expect(data.status).toBe(201);
    expect(data.data.message).toBe("Opening created!");
  });
});
