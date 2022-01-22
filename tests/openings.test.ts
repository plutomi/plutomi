import axios from "../utils/axios";
import { nanoid } from "nanoid";
import { ERRORS } from "../Config";

describe("Openings", () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data = await axios.post(`/jest-setup`);
    const cookie = data.headers["set-cookie"][0];

    axios.defaults.headers.Cookie = cookie;
  });

  it("fails to create an opening if a user is not in an org", async () => {
    try {
      await axios.post("/openings", {
        openingName: nanoid(10),
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it("fails to retrieve openings in an org if a user does not have an org", async () => {
    try {
      await axios.get("/openings");
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it("fails to retrieve a specific opening if a user does not have an org", async () => {
    try {
      await axios.get("/openings/123");
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it("fails to create an opening with a large name", async () => {
    // Create an org
    await axios.post("/orgs", {
      orgId: nanoid(20),
      displayName: nanoid(20),
    });

    try {
      await axios.post("/openings", {
        openingName: nanoid(2000),
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.openingName");
      expect(error.response.data.message).toContain(
        "less than or equal to 100"
      );
    }
  });

  it("creates an opening", async () => {
    const data = await axios.post("/openings", {
      openingName: nanoid(20),
    });

    expect(data.status).toBe(201);
    expect(data.data.message).toBe("Opening created!");
  });

  it("allows retrieving openings in an org", async () => {
    // Create an opening first
    await axios.post("/openings", {
      openingName: nanoid(10),
    });

    // Get openings in an org
    const data2 = await axios.get("/openings");

    expect(data2.status).toBe(200);
    expect(data2.data.length).toBeGreaterThanOrEqual(1);
  });

  it("returns a 404 if an opening does not exist", async () => {
    try {
      await axios.get("/openings/1");
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe("Opening not found");
    }
  });

  it("allows retrieving an opening by id", async () => {
    // Create an opening first
    await axios.post("/openings", {
      openingName: nanoid(10),
    });

    // Get openings in an org
    const data2 = await axios.get("/openings");

    // Get the first opening
    const opening = data2.data[0];

    // Test getting an opening by id
    const data3 = await axios.get(`/openings/${opening.openingId}`);
    expect(data3.status).toBe(200);
    expect(data3.data).toStrictEqual(opening);
  });

  it("allows updating an opening", async () => {
    // Create an opening
    await axios.post("/openings", {
      openingName: nanoid(10),
    });

    // Get openings in an org
    const data2 = await axios.get("/openings");

    // Get the first opening
    const opening = data2.data[0];

    const newName = nanoid(20);
    // Update the opening
    const data3 = await axios.put(`/openings/${opening.openingId}`, {
      openingName: newName,
    });

    expect(data3.status).toBe(200);
    expect(data3.data.message).toBe("Opening updated!");
  });

  it("blocks updating an opening with an extra long name", async () => {
    // Create an opening
    await axios.post("/openings", {
      openingName: nanoid(10),
    });

    // Get openings in an org
    const data2 = await axios.get("/openings");

    // Get the first opening
    const opening = data2.data[0];

    const newName = nanoid(100);

    // Update the opening
    try {
      await axios.put(`/openings/${opening.openingId}`, {
        openingName: newName,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.openingName");
      expect(error.response.data.message).toContain(
        "less than or equal to 100"
      );
    }
  });

  it("blocks editing forbidden properties of an opening", async () => {
    // Create an opening
    await axios.post("/openings", {
      openingName: nanoid(10),
    });

    // Get openings in an org
    const data2 = await axios.get("/openings");

    // Get the first opening
    const opening = data2.data[0];

    try {
      await axios.put(`/openings/${opening.openingId}`, {
        orgId: nanoid(5),
        PK: nanoid(5),
        SK: nanoid(5),
        createdAt: nanoid(5),
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("is not allowed");
    }
  });

  it("allows deleting openings", async () => {
    // Create an opening
    await axios.post("/openings", {
      openingName: nanoid(10),
    });

    // Get openings in an org
    const data = await axios.get("/openings");

    // Get the first opening
    const opening = data.data[0];

    const data2 = await axios.delete(`/openings/${opening.openingId}`);
    expect(data2.status).toBe(200);
    expect(data2.data.message).toBe("Opening deleted!");
  });

  it("allows updating stage order", async () => {
    const ourOpeningName = nanoid(15);
    // Create an opening
    await axios.post("/openings", {
      openingName: ourOpeningName,
    });

    // Get openings in an org
    const data = await axios.get("/openings");

    // Get the our opening
    const ourOpening = data.data.find(
      (opening) => opening.openingName === ourOpeningName
    );

    expect(ourOpening.stageOrder.length).toBe(0);
    // Add two stages to our opening
    await axios.post("/stages", {
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(20),
    });
    await axios.post("/stages", {
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(20),
    });

    const updatedOpening = await axios.get(`/openings/${ourOpening.openingId}`);

    expect(updatedOpening.data.stageOrder.length).toBe(2);

    // Update with new stage order
    const withNewOrder = await axios.put(`/openings/${ourOpening.openingId}`, {
      stageOrder: updatedOpening.data.stageOrder.reverse(),
    });

    expect(withNewOrder.status).toBe(200);
    expect(withNewOrder.data.message).toBe("Opening updated!");
  });
  it("blocks removing / adding stages in the stageOrder on the opening", async () => {
    const ourOpeningName = nanoid(15);
    // Create an opening
    await axios.post("/openings", {
      openingName: ourOpeningName,
    });

    // Get openings in an org
    const data = await axios.get("/openings");

    // Get the our opening
    const ourOpening = data.data.find(
      (opening) => opening.openingName === ourOpeningName
    );

    expect(ourOpening.stageOrder.length).toBe(0);
    // Add a stage to our opening
    await axios.post("/stages", {
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(20),
    });

    const updatedOpening = await axios.get(`/openings/${ourOpening.openingId}`);

    expect(updatedOpening.data.stageOrder.length).toBe(1);

    // Try adding a fake stage
    const newStageOrder = [...updatedOpening.data.stageOrder, nanoid(10)];

    try {
      await axios.put(`/openings/${ourOpening.openingId}`, {
        staeOrder: newStageOrder,
      });
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(
        "You cannot add / delete stages this way, please use the proper API methods for those actions"
      );
    }
  });
});
