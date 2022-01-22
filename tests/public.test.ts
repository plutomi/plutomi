import axios from "../utils/axios";
import { nanoid } from "nanoid";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

describe("Public", () => {
  /**
   * Creates a session cookie to create the necessary entities
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers["set-cookie"][0];

    axios.defaults.headers.Cookie = cookie;
  });

  const orgId = tagGenerator.generate(nanoid(30));
  const displayName = nanoid(20);
  it("returns a 404 if org not found", async () => {
    try {
      await axios.get(`/public/orgs/${nanoid(500)}`);
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe("Org not found");
    }
  });

  it("returns public information about an org", async () => {
    // Create an org
    await axios.post(`/orgs`, {
      orgId,
      displayName,
    });

    const data = await axios.get(`/public/orgs/${orgId}`);

    expect(data.status).toBe(200);
    expect(Object.keys(data.data)).toStrictEqual(["orgId", "displayName"]);
    expect(data.data.orgId).toBe(orgId);
    expect(data.data.displayName).toBe(displayName);
  });

  it("fails to make an opening public if there are no stages in it", async () => {
    const openingName = nanoid(20);

    // Create the opening
    await axios.post("/openings", {
      openingName,
    });

    const allOpenings = await axios.get("/openings");

    const ourOpening = allOpenings.data.find(
      (opening) => opening.openingName === openingName
    );

    // Try to update
    try {
      await axios.put(`/openings/${ourOpening.openingId}`, {
        newValues: {
          GSI1SK: "PUBLIC",
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        "An opening needs to have stages before being made public"
      );
    }
  });
  // TODO need to create opening, create stage, and then make opening public
  it("returns all public openings in an org", async () => {
    // Create two openings in the org
    const opening1Name = nanoid(20);
    const opening2Name = nanoid(20);

    await axios.post(`/openings`, {
      openingName: opening1Name,
    });

    await axios.post(`/openings`, {
      openingName: opening2Name,
    });

    const allOpenings = await axios.get("/openings");

    expect(allOpenings.status).toBe(200);
    expect(allOpenings.data.length).toBeGreaterThanOrEqual(2);
    const opening1 = allOpenings.data.find(
      (opening) => opening.openingName === opening1Name
    );

    // Add a stage to the opening so we can make it public
    await axios.post("/stages", {
      openingId: opening1.openingId,
      GSI1SK: nanoid(20),
    });

    // Make one of them public
    await axios.put(`/openings/${opening1.openingId}`, {
      newValues: {
        GSI1SK: "PUBLIC",
      },
    });

    const result = await axios.get(`/public/orgs/${opening1.orgId}/openings`);

    expect(result.status).toBe(200);
    expect(result.data.length).toBe(1);
    expect(Object.keys(result.data[0])).toStrictEqual([
      "openingName",
      "createdAt",
      "openingId",
    ]);
  });

  it("returns 403 if opening is private", async () => {
    // Create two openings in the org
    const opening1Name = nanoid(20);
    const opening2Name = nanoid(20);

    await axios.post(`/openings`, {
      openingName: opening1Name,
    });

    await axios.post(`/openings`, {
      openingName: opening2Name,
    });

    const allOpenings = await axios.get("/openings");

    expect(allOpenings.status).toBe(200);
    expect(allOpenings.data.length).toBeGreaterThanOrEqual(2);
    const opening1 = allOpenings.data.find(
      (opening) => opening.openingName === opening1Name
    );

    const opening2 = allOpenings.data.find(
      (opening) => opening.openingName === opening1Name
    );

    // Add a stage to the opening so we can make it public
    await axios.post("/stages", {
      openingId: opening1.openingId,
      GSI1SK: nanoid(20),
    });

    // Make one of them public
    await axios.put(`/openings/${opening1.openingId}`, {
      newValues: {
        GSI1SK: "PUBLIC",
      },
    });

    try {
      await axios.get(`/public/orgs/${orgId}/openings/${opening2.openingId}`);
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        "You cannot view this opening at this time"
      );
    }
  });
  it("returns public information about an opening", async () => {
    // Create an opening
    const openingName = nanoid(20);

    await axios.post(`/openings`, {
      openingName: openingName,
    });

    await axios.post(`/openings`, {
      openingName,
    });

    const allOpenings = await axios.get("/openings");

    expect(allOpenings.status).toBe(200);
    const ourOpening = allOpenings.data.find(
      (opening) => opening.openingName === openingName
    );

    // Add a stage to the opening so we can make it public
    await axios.post("/stages", {
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(20),
    });
    // Make the opening public
    await axios.put(`/openings/${ourOpening.openingId}`, {
      newValues: {
        GSI1SK: "PUBLIC",
      },
    });

    const result = await axios.get(
      `/public/orgs/${orgId}/openings/${ourOpening.openingId}`
    );

    expect(result.status).toBe(200);
    expect(Object.keys(result.data)).toStrictEqual([
      "openingName",
      "createdAt",
      "openingId",
    ]);
  });
});
