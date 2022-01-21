import axios, { AxiosResponse } from "axios";
import { nanoid } from "nanoid";
import { API_URL, DEFAULTS, ENTITY_TYPES, ERRORS } from "../Config";
const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

describe("Stages", () => {
  /**
   * Creates a session cookie
   */
  beforeAll(async () => {
    const data: AxiosResponse = await axios.post(API_URL + `/jest-setup`);
    const cookie = data.headers["set-cookie"][0];

    axios.defaults.headers.Cookie = cookie;
  });

  it("blocks creating stages if not in an org", async () => {
    try {
      await axios.post(API_URL + "/stages");
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it("blocks deletion of stages if user is not in an org", async () => {
    try {
      await axios.delete(API_URL + "/openings/123/stages/123");
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it("blocks retrieving stage info if user is not in an org", async () => {
    try {
      await axios.get(API_URL + "/openings/123/stages/123");
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.message).toBe(ERRORS.NEEDS_ORG);
    }
  });

  it("fails to create a stage without an empty empty values for openingId and stage name", async () => {
    // Create an org
    await axios.post(API_URL + "/orgs", {
      orgId: nanoid(20),
      displayName: nanoid(20),
    });
    try {
      await axios.post(API_URL + "/stages", {
        openingId: "",
        GSI1SK: null,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.openingId");
      expect(error.response.data.message).toContain(
        "is not allowed to be empty"
      );
      expect(error.response.data.message).toContain("must be a string");
    }
  });
  it("fails to create a stage with a position equal to MAX_CHILD_ITEM_LIMIT", async () => {
    try {
      await axios.post(API_URL + "/stages", {
        openingId: nanoid(10),
        GSI1SK: nanoid(10),
        position: DEFAULTS.MAX_CHILD_ITEM_LIMIT,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.position");
      expect(error.response.data.message).toContain(
        `must be less than or equal to ${DEFAULTS.MAX_CHILD_ITEM_LIMIT - 1}`
      );
    }
  });

  it("fails to create a stage with a position greater than MAX_CHILD_ITEM_LIMIT", async () => {
    try {
      await axios.post(API_URL + "/stages", {
        openingId: nanoid(10),
        GSI1SK: nanoid(10),
        position: 500000,
      });
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("body.position");
      expect(error.response.data.message).toContain(
        `must be less than or equal to ${DEFAULTS.MAX_CHILD_ITEM_LIMIT - 1}`
      );
    }
  });

  it("fails to create a stage in an opening that does not exist", async () => {
    try {
      await axios.post(API_URL + "/stages", {
        openingId: "1",
        GSI1SK: nanoid(10),
        position: 2,
      });
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe("Opening does not exist");
    }
  });

  it("creates a stage without a position", async () => {
    // TODO create an opening

    const openingName = nanoid(50);
    // Create an opening first
    await axios.post(API_URL + "/openings", {
      GSI1SK: openingName,
    });

    // Get openings in an org
    const data = await axios.get(API_URL + "/openings");

    const ourOpening = data.data.find(
      (opening) => opening.GSI1SK === openingName
    );

    await axios.post(API_URL + "/stages", {
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(10),
    });

    // Check if our newly added stage is there
    const ourOpening2 = await axios.get(
      API_URL + `/openings/${ourOpening.openingId}`
    );

    expect(ourOpening2.data.stageOrder.length).toBe(1);
  });

  it("allows deletion of stages", async () => {
    const openingName = nanoid(20);
    // Create an opening first
    await axios.post(API_URL + "/openings", {
      GSI1SK: openingName,
    });

    // Get openings in an org
    const data = await axios.get(API_URL + "/openings");

    const ourOpening = data.data.find(
      (opening) => opening.GSI1SK === openingName
    );

    // Create a stage
    await axios.post(API_URL + "/stages", {
      openingId: ourOpening.openingId,
      GSI1SK: nanoid(10),
    });

    const stageCreated = await axios.get(
      API_URL + `/openings/${ourOpening.openingId}`
    );

    const deleteStageRes = await axios.delete(
      API_URL +
        `/openings/${stageCreated.data.openingId}/stages/${stageCreated.data.stageOrder[0]}`
    );

    expect(deleteStageRes.status).toBe(200);
    expect(deleteStageRes.data.message).toBe("Stage deleted!");

    const afterdeletion = await axios.get(
      API_URL + `/openings/${ourOpening.openingId}`
    );

    expect(afterdeletion.status).toBe(200);
    expect(afterdeletion.data.stageOrder).toStrictEqual([]);
  });

  it("returns 404 if stage is not found while retrieving info", async () => {
    const openingName = nanoid(20);
    // Create an opening first
    await axios.post(API_URL + "/openings", {
      GSI1SK: openingName,
    });

    // Get openings in an org
    const data = await axios.get(API_URL + "/openings");

    const ourOpening = data.data.find(
      (opening) => opening.GSI1SK === openingName
    );

    try {
      await axios.get(API_URL + `/openings/${ourOpening.openingId}/stages/1`);
    } catch (error) {
      console.error(error);
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe("Stage not found");
    }
  });

  it("retrieves stage info", async () => {
    // Create an opening
    const openingName = nanoid(20);
    // Create an opening first
    await axios.post(API_URL + "/openings", {
      GSI1SK: openingName,
    });

    // Get openings in an org
    const data = await axios.get(API_URL + "/openings");

    const ourOpening = data.data.find(
      (opening) => opening.GSI1SK === openingName
    );

    const stageName = nanoid(10);
    // Create a stage
    await axios.post(API_URL + "/stages", {
      openingId: ourOpening.openingId,
      GSI1SK: stageName,
    });

    const updatedOpening = await axios.get(
      API_URL + `/openings/${ourOpening.openingId}`
    );

    const stage = await axios.get(
      API_URL +
        `/openings/${ourOpening.openingId}/stages/${updatedOpening.data.stageOrder[0]}`
    );

    expect(stage.status).toBe(200);
    expect(stage.data.GSI1SK).toBe(stageName);
  });
});
