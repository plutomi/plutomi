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

  it("blocks retrieving stages for an opening if not in an org", async () => {
    try {
      await axios.get(API_URL + "/openings/123/stages");
    } catch (error) {
      console.error("Error retrieving opening stages", error);
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

  it("blocks updating a stage if user is not in an org", async () => {
    try {
      await axios.put(API_URL + "/openings/123/stages/123");
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

  it("returns stages in an opening", async () => {
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

    const stage1Name = nanoid(10);
    const stage2Name = nanoid(10);

    // Create the two stages
    await axios.post(API_URL + "/stages", {
      openingId: ourOpening.openingId,
      GSI1SK: stage1Name,
    });
    await axios.post(API_URL + "/stages", {
      openingId: ourOpening.openingId,
      GSI1SK: stage2Name,
    });

    const data2 = await axios.get(
      API_URL + `/openings/${ourOpening.openingId}/stages`
    );

    expect(data2.status).toBe(200);
    expect(data2.data.length).toBe(2);

    const firstStage = data2.data[0];
    const secondStage = data2.data[1];
    expect(firstStage.GSI1SK).toBe(stage1Name);
    expect(secondStage.GSI1SK).toBe(stage2Name);
  });

  it("blocks updating forbidden properties of a stage", async () => {
    const openingName = nanoid(20);

    // Create an opening
    await axios.post(API_URL + "/openings", {
      GSI1SK: openingName,
    });

    // Get openings in an org
    const data = await axios.get(API_URL + "/openings");

    const ourOpening = data.data.find(
      (opening) => opening.GSI1SK === openingName
    );

    const stageName = nanoid(10);
    // Add a stage
    await axios.post(API_URL + "/stages", {
      openingId: ourOpening.openingId,
      GSI1SK: stageName,
    });

    const openingAfterStage = await axios.get(
      API_URL + `/openings/${ourOpening.openingId}`
    );

    const stageid = openingAfterStage.data.stageOrder[0];

    try {
      await axios.put(
        API_URL + `/openings/${ourOpening.openingId}/stages/${stageid}`,
        {
          newValues: {
            orgId: nanoid(5),
            PK: nanoid(5),
            SK: nanoid(5),
            createdAt: nanoid(5),
          },
        }
      );
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("is not allowed");
    }
  });

  it("allows updating a stage", async () => {
    const openingName = nanoid(20);

    // Create an opening
    await axios.post(API_URL + "/openings", {
      GSI1SK: openingName,
    });

    // Get openings in an org
    const data = await axios.get(API_URL + "/openings");

    const ourOpening = data.data.find(
      (opening) => opening.GSI1SK === openingName
    );

    const stageName = nanoid(10);
    // Add a stage
    await axios.post(API_URL + "/stages", {
      openingId: ourOpening.openingId,
      GSI1SK: stageName,
    });

    const openingAfterStage = await axios.get(
      API_URL + `/openings/${ourOpening.openingId}`
    );

    const stageid = openingAfterStage.data.stageOrder[0];

    const stageBefore = await axios.get(
      API_URL + `/openings/${ourOpening.openingId}/stages/${stageid}`
    );

    const newName = nanoid(20);

    const update = await axios.put(
      API_URL + `/openings/${ourOpening.openingId}/stages/${stageid}`,
      {
        newValues: {
          GSI1SK: newName,
        },
      }
    );

    expect(update.status).toBe(200);
    expect(update.data.message).toBe("Stage updated!");

    const stageAfter = await axios.get(
      API_URL + `/openings/${ourOpening.openingId}/stages/${stageid}`
    );

    console.log("BEFORE", stageBefore.data);
    console.log("AFTER", stageAfter.data);

    expect(stageAfter.data.GSI1SK).toBe(newName);
  });
});
