import axios, { AxiosResponse } from "axios";
import { nanoid } from "nanoid";
import { API_URL, DEFAULTS, ERRORS } from "../Config";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

describe("Public", () => {
  /**
   * Creates a session cookie to create the necessary entities
   */
  beforeAll(async () => {
    const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`);
    const cookie = data.headers["set-cookie"][0];

    axios.defaults.headers.Cookie = cookie;
  });

  const orgId = tagGenerator.generate(nanoid(30));
  const displayName = nanoid(20);
  it("returns a 404 if org not found", async () => {
    try {
      await axios.get(API_URL + `/public/orgs/${nanoid(500)}`);
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe("Org not found");
    }
  });

  it("retrieves public information about an org", async () => {
    // Create an org
    await axios.post(API_URL + `/orgs`, {
      orgId,
      displayName,
    });

    const data = await axios.get(API_URL + `/public/orgs/${orgId}`);

    expect(data.status).toBe(200);
    expect(Object.keys(data.data)).toStrictEqual(["orgId", "displayName"]);
    expect(data.data.orgId).toBe(orgId);
    expect(data.data.displayName).toBe(displayName);
  });

  // TODO need to create opening, create stage, and then make opening public
  it("retrieves all public openings in an org", async () => {});

  it("retrieves public information about an opening", async () => {});
});
