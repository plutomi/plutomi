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

  it("fails to retrieve openings in an org if a user does not have an org", async () => {
    try {
      await axios.get(API_URL + "/openings");
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it("fails to retrieve openings in an org if a user does not have an org", async () => {
    try {
      await axios.get(API_URL + "/openings/123");
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

  it("allows retrieving openings in an org", async () => {
    // Create an opening first
    await axios.post(API_URL + "/openings", {
      GSI1SK: nanoid(10),
    });

    // Get openings in an org
    const data2 = await axios.get(API_URL + "/openings");

    expect(data2.status).toBe(200);
    expect(data2.data.length).toBeGreaterThanOrEqual(1);
  });

  it("returns a 404 if an opening does not exist", async () => {
    try {
      await axios.get(API_URL + "/openings/1");
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe("Opening not found");
    }
  });

  it("allows retrieving an opening by id", async () => {
    // Create an opening first
    await axios.post(API_URL + "/openings", {
      GSI1SK: nanoid(10),
    });

    // Get openings in an org
    const data2 = await axios.get(API_URL + "/openings");

    // Get the first opening
    const opening = data2.data[0];

    // Test getting an opening by id
    const data3 = await axios.get(API_URL + `/openings/${opening.openingId}`);
    expect(data3.status).toBe(200);
    expect(data3.data).toStrictEqual(opening);
  });

  it("allows editing of an opening", async () => {
    // Create an opening
    await axios.post(API_URL + "/openings", {
      GSI1SK: nanoid(10),
    });

    // Get openings in an org
    const data2 = await axios.get(API_URL + "/openings");

    // Get the first opening
    const opening = data2.data[0];

    const newName = nanoid(20);
    // Update the opening
    const data3 = await axios.put(API_URL + `/openings/${opening.openingId}`, {
      newValues: {
        GSI1SK: newName,
      },
    });

    expect(data3.status).toBe(200);
    expect(data3.data.message).toBe("Opening updated!");
  });

  it("blocks updating an opening with an extra long name", async () => {
    // Create an opening
    await axios.post(API_URL + "/openings", {
      GSI1SK: nanoid(10),
    });

    // Get openings in an org
    const data2 = await axios.get(API_URL + "/openings");

    // Get the first opening
    const opening = data2.data[0];

    const newName = nanoid(100);

    // Update the opening
    try {
      await axios.put(API_URL + `/openings/${opening.openingId}`, {
        newValues: {
          GSI1SK: newName,
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.newValues.GSI1SK");
      expect(error.response.data.message).toContain(
        "less than or equal to 100"
      );
    }
  });

  it("blocks editing forbidden properties of an opening", async () => {
    // Create an opening
    await axios.post(API_URL + "/openings", {
      GSI1SK: nanoid(10),
    });

    // Get openings in an org
    const data2 = await axios.get(API_URL + "/openings");

    // Get the first opening
    const opening = data2.data[0];

    try {
      await axios.put(API_URL + `/openings/${opening.openingId}`, {
        newValues: {
          orgId: nanoid(5),
          PK: nanoid(5),
          SK: nanoid(5),
          createdAt: nanoid(5),
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("is not allowed");
    }
  });

  it("allows deleting openings", async () => {
    // Create an opening
    await axios.post(API_URL + "/openings", {
      GSI1SK: nanoid(10),
    });

    // Get openings in an org
    const data = await axios.get(API_URL + "/openings");

    // Get the first opening
    const opening = data.data[0];

    const data2 = await axios.delete(
      API_URL + `/openings/${opening.openingId}`
    );
    expect(data2.status).toBe(200);
    expect(data2.data.message).toBe("Opening deleted!");
  });
});
