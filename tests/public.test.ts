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
  it("retrieves all public openings in an org", async () => {
    // Create two openings in the org
    const opening1Name = nanoid(20);
    const opening2Name = nanoid(20);

    try {
      await axios.post(API_URL + `/openings`, {
        openingName: opening1Name,
      });
    } catch (error) {
      console.error(error);
    }

    try {
      await axios.post(API_URL + `/openings`, {
        openingName: opening2Name,
      });
    } catch (error) {
      console.error(error);
    }

    const allOpenings = await axios.get(API_URL + "/openings");

    expect(allOpenings.status).toBe(200);
    expect(allOpenings.data.length).toBe(2);
    const opening1 = allOpenings.data.find(
      (opening) => opening.openingName === opening1Name
    );

    // Make ONE them public // TODO this should require a stage
    // https://github.com/plutomi/plutomi/issues/531

    try {
      await axios.put(API_URL + `/openings/${opening1.openingId}`, {
        newValues: {
          GSI1SK: "PUBLIC",
        },
      });
    } catch (error) {
      console.error(error);
    }

    const result = await axios.get(
      API_URL + `/public/orgs/${opening1.orgId}/openings`
    );

    expect(result.status).toBe(200);
    expect(result.data.length).toBe(1);
    expect(Object.keys(result.data[0])).toStrictEqual([
      "openingName",
      "createdAt",
      "openingId",
    ]);
  });

  // TODO
  //   it("retrieves public information about an opening", async () => {});
});
